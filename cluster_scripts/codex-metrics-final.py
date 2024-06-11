#! /usr/bin/env python3

import sys
import argparse
import subprocess
import requests
from requests.auth import HTTPBasicAuth
import json
import os

hostnameProd = "https://life-cycle-manager.internal.thoughtspot.cloud"
hostnameDev = "https://life-cycle-manager.internal.thoughtspotdev.cloud"
hostnameStaging = "https://life-cycle-manager.internal.thoughtspotstaging.cloud"
username = "admin"
password = "th0ughtSp0t"
prodToken = "aW50ZXJuYWxwcm9kOlBydGgwdWdodFNwMHQ2NQ=="
repoUrl = "https://galaxy.corp.thoughtspot.com/dev/scaligent.git"

headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

headersProd = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": f"Basic {prodToken}"
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
        "--scenario_type",
        required=True,
        type=int,
        help="scenario"
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
        help="Feature",
        default="hello"
    )
    parser.add_argument(
        "--team",
        required=False,
        type=str,
        help="Team",
        default="ts-everywhere"
    )
    parser.add_argument(
        "--token",
        required=False,
        type=str,
        help="Git token"
    )
    parser.add_argument(
        "--patch_ids",
        required=False,
        type=str,
        nargs='+',  # '+' means one or more values are expected
        help="patches to be applied"
    )
    parser.add_argument(
        "--run_cmds",
        required=False,
        type=str,
        nargs='+',  # '+' means one or more values are expected
        help="commands to run"
    )
    parser.add_argument(
        "--env",
        required=False,
        type=str,
        help="Environment"
    )
    return parser.parse_args(argv[1:])

def getAllClusterInfo(clusterName,env):
    page = 0
    size = 100
    clusterStateList = True
    clusterDetails = None
    commands = []
    patches = []
    clusterId = None
    upgradeVersion = None
    currentVersion = None
    versionFound=False
    while clusterStateList:
        if(env == "prod"):
            url = f"{hostnameProd}/api/v2/clusters/state?page={page}&size={size}"
            response1 = requests.get(url, headers=headersProd)
        elif(env == "dev"):
            url = f"{hostnameDev}/api/v2/clusters/state?page={page}&size={size}"
            response1 = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
        else:
            url = f"{hostnameStaging}/api/v2/clusters/state?page={page}&size={size}"
            response1 = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
        clusterStateList = response1.json()["clusterStateList"]
        if not clusterStateList:
            break
        for cluster in clusterStateList:
            if cluster["clusterName"] == clusterName and cluster["operationalState"] != "DELETE":
                clusterId = cluster["clusterId"]
                clusterDetails=cluster
        page += 1
    if not clusterId:
        print(f"Cluster {clusterName} not found")
        return None
    if(env == "prod"):
        url = f"{hostnameProd}/api/v2/workflows/clusters/{clusterId}"
        response2 = requests.get(url, headers=headersProd)
    elif(env == "dev"):
        url = f"{hostnameDev}/api/v2/workflows/clusters/{clusterId}"
        response2 = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
    else:
        url = f"{hostnameStaging}/api/v2/workflows/clusters/{clusterId}"
        response2 = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
    workflowDetails = response2.json()
    for workflow in workflowDetails:
        if "metadata" in workflow:
            if "command" in workflow["metadata"]:
                commands.append(workflow["metadata"]["command"])
            if "patch_id" in workflow["metadata"]:
                patches.append(workflow["metadata"]["patch_id"])
        if versionFound==False and "workflowType" in workflow and workflow["workflowType"] == "Cluster-Upgrade":
            if "status" in workflow and workflow["status"] == "SUCCEEDED":
                if "metadata" in workflow and "current_version" in workflow["metadata"]:
                    currentVersion = workflow["metadata"]["current_version"]
                if "metadata" in workflow and "upgrade_version" in workflow["metadata"]:
                    upgradeVersion = workflow["metadata"]["upgrade_version"]
                versionFound=True
    return clusterId,clusterDetails,commands,currentVersion,upgradeVersion,patches


def getClusterVersion(clusterName, env):
    page = 0
    size = 100
    clusterStateList = True
    clusterId = None
    while clusterStateList:
        if(env == "prod"):
            url = f"{hostnameProd}/api/v2/clusters/state?page={page}&size={size}"
            response = requests.get(url, headers=headersProd)
        elif(env == "dev"):
            url = f"{hostnameDev}/api/v2/clusters/state?page={page}&size={size}"
            response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
        else:
            url = f"{hostnameStaging}/api/v2/clusters/state?page={page}&size={size}"
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


# def getClusterInformation(clusterName, env):
#     page = 0
#     size = 100
#     clusterStateList = True
#     clusterDetails = None
        
#     while clusterStateList:
#         if(env == "prod"):
#             url = f"{hostnameProd}/api/v2/clusters/state?page={page}&size={size}"
#             response = requests.get(url, headers=headersProd)
#         elif(env == "dev"):
#             url = f"{hostnameDev}/api/v2/clusters/state?page={page}&size={size}"
#             response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
#         else:
#             url = f"{hostnameStaging}/api/v2/clusters/state?page={page}&size={size}"
#             response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
#         clusterStateList = response.json()["clusterStateList"]
#         if not clusterStateList:
#             break
#         for cluster in clusterStateList:
#             if cluster["clusterName"] == clusterName and cluster["operationalState"] != "DELETE":
#                 clusterDetails = cluster
#         page += 1
#     if not clusterDetails:
#         print(f"Cluster {clusterName} not found")
#         return None
#     return clusterDetails

# def getCommands(clusterName, env):
#     commands = []
#     clusterId = getClusterVersion(clusterName, env)
#     if not clusterId:
#         return None
#     if(env == "prod"):
#         url = f"{hostnameProd}/api/v2/workflows/clusters/{clusterId}"
#         response = requests.get(url, headers=headersProd)
#     elif(env == "dev"):
#         url = f"{hostnameDev}/api/v2/workflows/clusters/{clusterId}"
#         response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
#     else:
#         url = f"{hostnameStaging}/api/v2/workflows/clusters/{clusterId}"
#         response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
#     workflowDetails = response.json()
#     for workflow in workflowDetails:
#         if "metadata" in workflow:
#             if "command" in workflow["metadata"]:
#                 commands.append(workflow["metadata"]["command"])
#     return commands

# def getAppliedPatches(clusterName, env):
#     patches = []
#     clusterId = getClusterVersion(clusterName, env)
#     if not clusterId:
#         return None
#     if(env == "prod"):
#         url = f"{hostnameProd}/api/v2/workflows/clusters/{clusterId}"
#         response = requests.get(url, headers=headersProd)
#     elif(env == "dev"):
#         url = f"{hostnameDev}/api/v2/workflows/clusters/{clusterId}"
#         response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
#     else:
#         url = f"{hostnameStaging}/api/v2/workflows/clusters/{clusterId}"
#         response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
#     workflowDetails = response.json()
#     for workflow in workflowDetails:
#         if "metadata" in workflow:
#             if "patch_id" in workflow["metadata"]:
#                 patches.append(workflow["metadata"]["patch_id"])
#     return patches

def applyPatches(userEmail, clusterName, patchIds, env):
    clusterId = getClusterVersion(clusterName, env)
    if not clusterId:
        return None
    print(clusterId)
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
        if(env == "prod"):
            url = f"{hostnameProd}/api/v2/clusters/patch"
            headers["Authorization"] = f"Basic {prodToken}"
            response = requests.post(url, headers=headersProd, json=data)
        elif(env == "dev"):
            url = f"{hostnameDev}/api/v2/clusters/patch"
            response = requests.post(url, auth=HTTPBasicAuth(username, password), json=data, headers=headers)
        else:
            url = f"{hostnameStaging}/api/v2/clusters/patch"
            response = requests.post(url, auth=HTTPBasicAuth(username, password), json=data, headers=headers)
        if response.status_code != 200:
            print(response)
            print(f"Error applying patch {patchId}")
    return response.status_code

def applyTSCLICommands(user_email, clusterName, commands, env):
    clusterId = getClusterVersion(clusterName, env)
    if not clusterId:
        return None
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
        if(env == "prod"):
            url = f"{hostnameProd}/api/v2/clusters/configure"
            headers["Authorization"] = f"Basic {prodToken}"
            response = requests.post(url, headers=headersProd, json=data)
        elif(env == "dev"):
            url = f"{hostnameDev}/api/v2/clusters/configure"
            response = requests.post(url, auth=HTTPBasicAuth(username, password), json=data, headers=headers)
        else:
            url = f"{hostnameStaging}/api/v2/clusters/configure"
            response = requests.post(url, auth=HTTPBasicAuth(username, password), json=data, headers=headers)
        print(response)
        if response.status_code < 200 or response.status_code > 299:
            
            print(f"Error applying command {command}")
    return response

# def getClusterCurrentAndUpgradeVersion(clusterName, env):
#     clusterId = getClusterVersion(clusterName, env)
#     if not clusterId:
#         return None
#     if(env == "prod"):
#         url = f"{hostnameProd}/api/v2/workflows/clusters/{clusterId}"
#         response = requests.get(url, headers=headersProd)
#     elif(env == "dev"):
#         url = f"{hostnameDev}/api/v2/workflows/clusters/{clusterId}"
#         response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
#     else:
#         url = f"{hostnameStaging}/api/v2/workflows/clusters/{clusterId}"
#         response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
#     workflowDetails = response.json()
#     upgradeVersion = None
#     currentVersion = None
#     for workflow in workflowDetails:
#         if "workflowType" in workflow and workflow["workflowType"] == "Cluster-Upgrade":
#             if "status" in workflow and workflow["status"] == "SUCCEEDED":
#                 if "metadata" in workflow and "current_version" in workflow["metadata"]:
#                     currentVersion = workflow["metadata"]["current_version"]
#                 if "metadata" in workflow and "upgrade_version" in workflow["metadata"]:
#                     upgradeVersion = workflow["metadata"]["upgrade_version"]
#                 break
#     return currentVersion, upgradeVersion

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

def getflagDetails(clusterId, env):
    # clusterId = getClusterVersion(clusterName, env)
    if env == "prod":
        url = f"{hostnameProd}/api/v2/clusters/{clusterId}/overrides"
        response = requests.get(url, headers=headersProd)
    elif env == "dev":
        url = f"{hostnameDev}/api/v2/clusters/{clusterId}/overrides"
        response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
    else:
        url = f"{hostnameStaging}/api/v2/clusters/{clusterId}/overrides"
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
    aws_file_path = os.path.dirname(os.path.realpath(__file__))+'/../sandbox/cluster_scripts/xxx.txt'
    with open(aws_file_path, 'w', encoding='utf-8') as f:
        f.write(clusterName)
        f.write(ownerEmail)
        f.write(imageTag)
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
    return response.status_code

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
    return response.status_code

def enableLogCollection(clusterName, userEmail, env):
    clusterId = getClusterVersion(clusterName, env)
    if not clusterId:
        return None
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Email": userEmail
    }
    if env == "prod":
        url = f"{hostnameProd}/api/v2/clusters/{clusterId}/logcollection/enable"
        response = requests.post(url, headers=headersProd)
    elif env == "dev":
        url = f"{hostnameDev}/api/v2/clusters/{clusterId}/logcollection/enable"
        response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers)
    else:
        url = f"{hostnameStaging}/api/v2/clusters/{clusterId}/logcollection/enable"
        response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers)
    return response.status_code

def disableLogCollection(clusterName, userEmail, env):
    clusterId = getClusterVersion(clusterName, env)
    if not clusterId:
        return None
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Email": userEmail
    }
    if env == "prod":
        headers["Authorization"] = f"Basic {prodToken}"
        url = f"{hostnameProd}/api/v2/clusters/{clusterId}/logcollection/disable"
        response = requests.post(url, headers=headersProd)
    elif env == "dev":
        url = f"{hostnameDev}/api/v2/clusters/{clusterId}/logcollection/disable"
        response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers)
    else:
        url = f"{hostnameStaging}/api/v2/clusters/{clusterId}/logcollection/disable"
        response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers)
    return response.status_code

def getArchivedLogs(clusterName, userEmail, files, logDuration, services, startDate, env):
    clusterId = getClusterVersion(clusterName, env)
    if not clusterId:
        return None
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Email": userEmail
    }
    request_body = {
        "files": files,
        "logDuration": logDuration,
        "services": services,
        "startDate": startDate
    }
    if env == "prod":
        headers["Authorization"] = f"Basic {prodToken}"
        url = f"{hostnameProd}/api/v2/clusters/{clusterId}/archivedlogs"
        response = requests.post(url, headers=headersProd, json=request_body)
    elif env == "dev":
        url = f"{hostnameDev}/api/v2/clusters/{clusterId}/archivedlogs"
        response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers, json=request_body)
    else:
        url = f"{hostnameStaging}/api/v2/clusters/{clusterId}/archivedlogs"
        response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers, json=request_body)
    return response.status_code

def getLogCollectionStatus(clusterName, userEmail, env):
    clusterId = getClusterVersion(clusterName, env)
    if not clusterId:
        return None
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Email": userEmail
    }
    if env == "prod":
        headers["Authorization"] = f"Basic {prodToken}"
        url = f"{hostnameProd}/api/v2/clusters/{clusterId}/logcollection"
        response = requests.get(url, headers=headersProd)
    elif env == "dev":
        url = f"{hostnameDev}/api/v2/clusters/{clusterId}/logcollection"
        response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
    else:
        url = f"{hostnameStaging}/api/v2/clusters/{clusterId}/logcollection"
        response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers)
    return response.status_code


def main(argv):
    args = parse_cmd(argv)
    clusterName = args.cluster_name
    ownerEmail = args.owner_email
    imageTag = args.image_tag
    feature = args.feature
    team = args.team
    token = args.token
    env = args.env
    scenario = args.scenario_type
    patchIds = args.patch_ids
    commands = args.run_cmds
    # response = createAWSSaasCluster(clusterName, ownerEmail, imageTag, feature, team)
    # print(response.json())
    # response = createGCPSaasCluster(clusterName, ownerEmail, imageTag)
    # print(response.json())
    # gitSha = getSha(imageTag, token)
    # print(f"Git SHA for tag {imageTag}: {gitSha}")
    # clusterDetails = getClusterInformation(clusterName, env)
    # print(f"Cluster details for {clusterName}: {clusterDetails}")
    # clusterVersion = getClusterVersion(clusterName, env)
    # print(f"Cluster version for {clusterName}: {clusterVersion}")
    # commands = getCommands(clusterName, env)
    # print(f"Commands for {clusterName}: {commands}")
    # appliedPatches = getAppliedPatches(clusterName, env)
    # print(f"Applied patches for {clusterName}: {appliedPatches}")
    # currentVersion, upgradeVersion = getClusterCurrentAndUpgradeVersion(clusterName, env)
    # print(f"Current version for {clusterName}: {currentVersion}")
    # print(f"Upgrade version for {clusterName}: {upgradeVersion}")
    # flagDetails = getflagDetails(clusterName, env)
    # print(f"Flag details for {clusterName}: {flagDetails}")
    if scenario == 1:
        clusterId,clusterDetails,commands,currentVersion,upgradeVersion,patches = getAllClusterInfo(clusterName,env)
        # clusterDetails = getClusterInformation(clusterName)
        clusterDetails_file_path = os.path.dirname(os.path.realpath(__file__))+'/../sandbox/cluster_scripts/clusterDetails.txt'
        # clusterDetails_file_path = '/Users/piyush.tayal/Downloads/clusterDetails99.txt'
        with open(clusterDetails_file_path, 'w', encoding='utf-8') as f:
            json.dump(clusterDetails,f, ensure_ascii=False, indent=4)
        # print(f"Cluster details for {clusterName}: {clusterDetails}")
        # clusterVersion = getClusterVersion(clusterName)
        clusterVersion_file_path = os.path.dirname(os.path.realpath(__file__))+'/../sandbox/cluster_scripts/clusterVersion.txt'
        with open(clusterVersion_file_path, 'w', encoding='utf-8') as f:
            f.write(str(clusterId))
        # print(f"Cluster version for {clusterName}: {clusterVersion}")
        # commands = getCommands(clusterName)
        commands_file_path = os.path.dirname(os.path.realpath(__file__))+'/../sandbox/cluster_scripts/commands.txt'
        with open(commands_file_path, 'w', encoding='utf-8') as f:
            f.write(str(commands))
        # print(f"Commands for {clusterName}: {commands}")
        # currentVersion, upgradeVersion = getClusterCurrentAndUpgradeVersion(clusterName)
        imageTag=currentVersion
        version_file_path = os.path.dirname(os.path.realpath(__file__))+'/../sandbox/cluster_scripts/version.txt'
        with open(version_file_path, 'w', encoding='utf-8') as f:
            f.write(f'Current version {currentVersion}\nUpgrade version {upgradeVersion}')
        # appliedPatches = getAppliedPatches(clusterName)
        appliedPatches_file_path = os.path.dirname(os.path.realpath(__file__))+'/../sandbox/cluster_scripts/appliedPatches.txt'
        with open(appliedPatches_file_path, 'w', encoding='utf-8') as f:
            f.write(str(patches))
        flagDetails = getflagDetails(clusterId,env)
        flagDetails_file_path = os.path.dirname(os.path.realpath(__file__))+'/../sandbox/cluster_scripts/flagDetails.txt'
        with open(flagDetails_file_path, 'w', encoding='utf-8') as f:
            json.dump(flagDetails,f, ensure_ascii=False, indent=4)
        sha = getSha(imageTag,token)
        sha_file_path = os.path.dirname(os.path.realpath(__file__))+'/../sandbox/cluster_scripts/sha.txt'
        with open(sha_file_path, 'w', encoding='utf-8') as f:
            f.write(f'{sha}')
    elif scenario == 2:
        gcp = createGCPSaasCluster(clusterName, ownerEmail, imageTag)
        gcp_file_path = os.path.dirname(os.path.realpath(__file__))+'/../sandbox/cluster_scripts/gcp.txt'
        with open(gcp_file_path, 'w', encoding='utf-8') as f:
            f.write(str(gcp))
    elif scenario == 3:
        aws = createAWSSaasCluster(clusterName,ownerEmail,imageTag,feature,team)
        aws_file_path = os.path.dirname(os.path.realpath(__file__))+'/../sandbox/cluster_scripts/aws.txt'
        with open(aws_file_path, 'w', encoding='utf-8') as f:
            f.write(str(aws))
    elif scenario==4:
        patched = applyPatches(ownerEmail,clusterName,patchIds,env)
        patched_file_path = os.path.dirname(os.path.realpath(__file__))+'/../sandbox/cluster_scripts/patched.txt'
        with open(patched_file_path, 'w', encoding='utf-8') as f:
            f.write(str(patched))
    elif scenario==5:
        cmds_run = applyTSCLICommands(ownerEmail,clusterName,commands,env)
        cmds_run_file_path=os.path.dirname(os.path.realpath(__file__))+'/../sandbox/cluster_scripts/cmds_run.txt'
        with open(cmds_run_file_path, 'w', encoding='utf-8') as f:
            f.write(str(cmds_run))

if __name__ == "__main__":
    main(sys.argv)