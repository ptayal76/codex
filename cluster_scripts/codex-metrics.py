#! /usr/bin/env python3

import sys
import argparse
import subprocess
import requests
from requests.auth import HTTPBasicAuth
import json

hostname = "https://life-cycle-manager.internal.thoughtspotstaging.cloud"
username = "admin"
password = "th0ughtSp0t"
repoUrl = "https://galaxy.corp.thoughtspot.com/dev/scaligent.git"

headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

def parse_cmd(argv):
    parser = argparse.ArgumentParser(
        usage=argparse.SUPPRESS,
        formatter_class=argparse.RawDescriptionHelpFormatter,
        description='''
        This file provides command line to get cluster details
        '''
    )
    parser.add_argument(
        "--cluster_name",
        required=False,
        type=str,
        help="Cluster Name"
    )
    parser.add_argument(
        "--owner_email",
        required=False,
        type=str,
        help="Owner Email"
    )
    parser.add_argument(
        "--image_tag",
        required=False,
        type=str,
        help="Image Tag"
    )
    parser.add_argument(
        "--feature",
        required=False,
        type=str,
        help="Feature"
    )
    parser.add_argument(
        "--team",
        required=False,
        type=str,
        help="Team"
    )
    parser.add_argument(
        "--token",
        required=False,
        type=str,
        help="Git token"
    )
    return parser.parse_args(argv[1:])

def getClusterVersion(clusterName):
    page = 0
    size = 100
    clusterStateList = True
    clusterId = None
    while clusterStateList:
        url = f"{hostname}/api/v2/clusters/state?page={page}&size={size}"
        response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
        clusterStateList = response.json()["clusterStateList"]
        if not clusterStateList:
            break
        for cluster in clusterStateList:
            if cluster["clusterName"] == clusterName and cluster["operationalState"] != "DELETE":
                clusterId = cluster["clusterId"]
        page += 1
    if not clusterId:
        print(f"Cluster {clusterName} not found")
        return None
    return clusterId


def getClusterInformation(clusterName):
    page = 0
    size = 100
    clusterStateList = True
    clusterDetails = None
    while clusterStateList:
        url = f"{hostname}/api/v2/clusters/state?page={page}&size={size}"
        response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
        clusterStateList = response.json()["clusterStateList"]
        if not clusterStateList:
            break
        for cluster in clusterStateList:
            if cluster["clusterName"] == clusterName and cluster["operationalState"] != "DELETE":
                clusterDetails = cluster
        page += 1
    if not clusterDetails:
        print(f"Cluster {clusterName} not found")
        return None
    return clusterDetails

def getCommands(clusterName):
    commands = []
    clusterId = getClusterVersion(clusterName)
    if not clusterId:
        return None
    url = f"{hostname}/api/v2/workflows/clusters/{clusterId}"
    response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
    workflowDetails = response.json()
    for workflow in workflowDetails:
        if "metadata" in workflow:
            if "command" in workflow["metadata"]:
                commands.append(workflow["metadata"]["command"])
    return commands

def getAppliedPatches(clusterName):
    patches = []
    clusterId = getClusterVersion(clusterName)
    if not clusterId:
        return None
    url = f"{hostname}/api/v2/workflows/clusters/{clusterId}"
    response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
    workflowDetails = response.json()
    for workflow in workflowDetails:
        if "metadata" in workflow:
            if "patch_id" in workflow["metadata"]:
                patches.append(workflow["metadata"]["patch_id"])
    return patches

def applyPatches(userEmail, clusterName, patchIds):
    clusterId = getClusterVersion(clusterName)
    if not clusterId:
        return None
    url = f"{hostname}/api/v2/clusters/patch"
    for patchId in patchIds:
        data = {
            "clusterIds": [
                clusterId
            ],
            "patchId": patchId
        }
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Email": userEmail
        }
        response = requests.post(url, auth=HTTPBasicAuth(username, password), json=data, headers=headers)
        if response.status_code != 200:
            print(f"Error applying patch {patchId}")
    return response.status_code

def applyTSCLICommands(user_email, clusterName, commands):
    clusterId = getClusterVersion(clusterName)
    if not clusterId:
        return None
    url = f"{hostname}/api/v2/clusters/configure"
    for command in commands:
        data = {
            "clusterIds": [
                clusterId
            ],
            "command": command,
            "runHost": "",
            "runOnAllNodes": True
        }
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Email": user_email
        }
        response = requests.post(url, auth=HTTPBasicAuth(username, password), json=data, headers=headers)
        if response.status_code != 200:
            print(f"Error applying command {command}")
    return response.status_code

def getClusterCurrentAndUpgradeVersion(clusterName):
    clusterId = getClusterVersion(clusterName)
    if not clusterId:
        return None
    url = f"{hostname}/api/v2/workflows/clusters/{clusterId}"
    response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
    workflowDetails = response.json()
    upgradeVersion = None
    currentVersion = None
    for workflow in workflowDetails:
        if "workflowType" in workflow and workflow["workflowType"] == "Cluster-Upgrade":
            if "status" in workflow and workflow["status"] == "SUCCEEDED":
                if "metadata" in workflow and "current_version" in workflow["metadata"]:
                    currentVersion = workflow["metadata"]["current_version"]
                if "metadata" in workflow and "upgrade_version" in workflow["metadata"]:
                    upgradeVersion = workflow["metadata"]["upgrade_version"]
                break
    return currentVersion, upgradeVersion

def getSha(imageTag, token):
    try:
        authRepoUrl = repoUrl.replace("https://", f"https://{token}@")
        result = subprocess.run(
            ["git", "ls-remote", "--tags", authRepoUrl],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        
        for line in result.stdout.splitlines():
            if f"refs/tags/{imageTag}" in line:
                sha = line.split()[0]
                return sha
        
        print(f"Tag {imageTag} not found in repository {repoUrl}")
    
    except subprocess.CalledProcessError as e:
        print(f"Error running git command: {e.stderr}")
    return None

def getflagDetails(clusterName):
    clusterId = getClusterVersion(clusterName)
    url = f"{hostname}/api/v2/clusters/{clusterId}/overrides"
    response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
    data = response.json()
    flagDetails = {}
    filteredServices = []
    if "services" in data:
        services = data["services"]
        for service in services:
            filteredService = {}
            if "tasks" in service:
                tasks = service["tasks"]
                filteredTasks = []
                for task in tasks:
                    filteredTask = {}
                    if "flags" in task:
                        flags = task["flags"]
                        filteredFlags = []
                        for flag in flags:
                            filteredFlag = {}
                            if "overriden" in flag and flag["overriden"] == True:
                                filteredFlag["name"] = flag["name"]
                                filteredFlag["value"] = flag["value"]
                                filteredFlags.append(filteredFlag)
                        if filteredFlags:
                            filteredTask["flags"] = filteredFlags
                    if filteredTask:
                        filteredTask["name"] = task["name"]
                        filteredTasks.append(filteredTask)
                if filteredTasks:
                    filteredService["tasks"] = filteredTasks
            if filteredService:
                filteredService["name"] = service["name"]
                filteredServices.append(filteredService)
    if filteredServices:
        flagDetails['services'] = filteredServices
    return flagDetails

def createAWSSaasCluster(clusterName, ownerEmail, imageTag, feature, team):
    url = "https://life-cycle-manager.internal.thoughtspotdev.cloud"
    common_tags = {
        "Owner" : ownerEmail,
        "Team" : team,
        "Source" : "Nebula",
        "IntendedUse" : "Development",
        "BusinessUnit" : "Engineering",
        "Project" : feature
    }

    request_body = {
        "CustomerID": clusterName,
        "BaseReleaseVersion": imageTag,
        "CustomAMI": "",
        "AssetID": clusterName,
        "AdminEmail": ownerEmail,
        "Environment": "AWS",
        "NebulaRequest": True,
        "OpportunityID": clusterName,
        "ProductSKU": ["TS-100S-1-ENT-PROD-500U-CLOUD"],
        "CloudConsumption": "100M",
        "Region": "us-west-2",
        "RequestedCustomerURL": clusterName,
        "Paid": False,
        "Timezone": "GMT-05:00",
        "TestInstance": False,
        "MultiNode": False,
        "Okta": False,
        "Ear": False,
        "DiskSize": "",
        "commonTags": common_tags
    }

    request_body_json = json.dumps(request_body)
    url = f"{url}/api/v2/clusters"
    response = requests.post(url, auth=(username, password), headers=headers, data=request_body_json)
    return response

def createGCPSaasCluster(clusterName, ownerEmail, imageTag):

    url = "https://ops.internal.thoughtspotdev.cloud/api/v1/kube-server/apis/thoughtspot.com/v2/namespaces/cosmos/tenants"

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": "SSWS 00z-s-tSMbobJ7B1mVnRJ7fFlugRhJyzHGiTfsiQOw"
    }

    request_body = {
        "apiVersion":"thoughtspot.com/v2",
        "kind":"Tenant",
        "metadata":{
            "name":"replace-with-id",
            "namespace":"cosmos"
        },
        "spec":{
            "adminEmail":ownerEmail,
            "applyFleetPatches":True,
            "billingModel":"Query",
            "data_disk_size":200,
            "dns":clusterName,
            "dryRun":False,
            "enableWakeupKey":False,
            "env":{
                "atomID":"1dd1a600-92ba-462e-b745-d8fc8d1b1e80",
                "cellID":"611a9ce4-63f0-4979-a43a-98e10b39",
                "cloud":"GCP",
                "gcp":{
                    "project":"ts-dev-03",
                    "region":"us-east4"
                },
                "tenantID":""
            },
            "eulaGracePeriod":0,
            "fasterDeliveryEnabled":False,
            "idlesenseEnabled":False,
            "isClusterIdle":False,
            "maintenance":False,
            "mode":"Active",
            "nodeType":"e2-highmem-8",
            "paid":False,
            "productType":"ENTERPRISE",
            "release":imageTag,
            "sku":"ts-100s-1-ent-prod-500u-cloud-pot",
            "tags":{
                "classification":"restricted",
                "ephemeral":False
            },
            "useSpotVM":True
        }
    }

    request_body_json = json.dumps(request_body)
    response = requests.post(url, headers=headers, data=request_body_json)
    return response

def enableLogCollection(clusterName, userEmail):
    clusterId = getClusterVersion(clusterName)
    if not clusterId:
        return None
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Email": userEmail
    }
    url = f"{hostname}/api/v2/clusters/{clusterId}/logcollection/enable"
    response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers)
    return response.status_code

def disableLogCollection(clusterName, userEmail):
    clusterId = getClusterVersion(clusterName)
    if not clusterId:
        return None
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Email": userEmail
    }
    url = f"{hostname}/api/v2/clusters/{clusterId}/logcollection/disable"
    response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers)
    return response.status_code

def getArchivedLogs(clusterName, userEmail, files, logDuration, services, startDate):
    clusterId = getClusterVersion(clusterName)
    if not clusterId:
        return None
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Email": userEmail
    }
    url = f"{hostname}/api/v2/clusters/{clusterId}/archivedlogs"
    request_body = {
        "files": files,
        "logDuration": logDuration,
        "services": services,
        "startDate": startDate
    }
    response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers, json=request_body)
    return response.status_code

def getLogCollectionStatus(clusterName, userEmail):
    clusterId = getClusterVersion(clusterName)
    if not clusterId:
        return None
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Email": userEmail
    }
    url = f"{hostname}/api/v2/clusters/{clusterId}/logcollection"
    response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
    return response.status_code

def main(argv):
    args = parse_cmd(argv)
    clusterName = args.cluster_name
    ownerEmail = args.owner_email
    imageTag = args.image_tag
    feature = args.feature
    team = args.team
    token=args.token
    scenario = args.scenario_type
    # response = createGCPSaasCluster(clusterName, ownerEmail, imageTag, feature, team)
    # print(response.json())
    # gitSha = getSha(imageTag, token)
    # print(f"Git SHA for tag {imageTag}: {gitSha}")
    if scenario == 1:
        currentVersion, upgradeVersion = getClusterCurrentAndUpgradeVersion(clusterName)
        imageTag=currentVersion
        version_file_path = '/Users/piyush.tayal/Downloads/codex-be/sandbox/cluster_scripts/version.txt'
        with open(version_file_path, 'w', encoding='utf-8') as f:
            f.write(f'Current version {currentVersion}\nUpgrade version {upgradeVersion}')
        clusterDetails = getClusterInformation(clusterName)
        clusterDetails_file_path = '/Users/piyush.tayal/Downloads/codex-be/sandbox/cluster_scripts/clusterDetails.json'
        with open(clusterDetails_file_path, 'w', encoding='utf-8') as f:
            json.dump(clusterDetails,f, ensure_ascii=False, indent=4)
        # print(f"Cluster details for {clusterName}: {clusterDetails}")
        clusterVersion = getClusterVersion(clusterName)
        clusterVersion_file_path = '/Users/piyush.tayal/Downloads/codex-be/sandbox/cluster_scripts/clusterVersion.txt'
        with open(clusterVersion_file_path, 'w', encoding='utf-8') as f:
            f.write(str(clusterVersion))
        # print(f"Cluster version for {clusterName}: {clusterVersion}")
        commands = getCommands(clusterName)
        commands_file_path = '/Users/piyush.tayal/Downloads/codex-be/sandbox/cluster_scripts/commands.txt'
        with open(commands_file_path, 'w', encoding='utf-8') as f:
            f.write(str(commands))
        # print(f"Commands for {clusterName}: {commands}")
        appliedPatches = getAppliedPatches(clusterName)
        appliedPatches_file_path = '/Users/piyush.tayal/Downloads/codex-be/sandbox/cluster_scripts/appliedPatches.txt'
        with open(appliedPatches_file_path, 'w', encoding='utf-8') as f:
            f.write(str(appliedPatches))
        sha = getSha(imageTag,token)
        sha_file_path = '/Users/piyush.tayal/Downloads/codex-be/sandbox/cluster_scripts/sha.txt'
        with open(sha_file_path, 'w', encoding='utf-8') as f:
            f.write(f'{sha}')
        # print(f"Applied patches for {clusterName}: {appliedPatches}")
        # print(f"Current version for {clusterName}: {currentVersion}")
        # print(f"Upgrade version for {clusterName}: {upgradeVersion}")
        flagDetails = getflagDetails(clusterName)
        flagDetails_file_path = '/Users/piyush.tayal/Downloads/codex-be/sandbox/cluster_scripts/flagDetails.json'
        with open(flagDetails_file_path, 'w', encoding='utf-8') as f:
            json.dump(flagDetails,f, ensure_ascii=False, indent=4)
    elif scenario == 2:
        gcp = createGCPSaasCluster(clusterName, ownerEmail, imageTag)
        gcp_file_path = '/Users/piyush.tayal/Downloads/codex-be/sandbox/cluster_scripts/gcp.txt'
        with open(gcp_file_path, 'w', encoding='utf-8') as f:
            f.write(str(gcp))
    elif scenario == 3:
        aws = createAWSSaasCluster(clusterName,ownerEmail,imageTag,feature,team)
        aws_file_path = '/Users/piyush.tayal/Downloads/codex-be/sandbox/cluster_scripts/aws.txt'
        with open(aws_file_path, 'w', encoding='utf-8') as f:
            f.write(str(aws))

if __name__ == "__main__":
    main(sys.argv)