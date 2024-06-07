#! /usr/bin/env python3
#
# Example Input Args: https://asda.csb.app 172.32.46.211 8443
# url: "https://172.32.46.211:8443"
# domain: "https://asda.csb.app"
#

import requests
import sys
import json
import os

# domain = "https://asda.csb.app"
# cluster_ip = "172.32.46.211"
# cluster_port = "8443"

input_url = sys.argv[1]
domain = sys.argv[2]

def check_cors():
    url = f"{input_url}/api/rest/2.0/auth/token/full"

    payload = json.dumps({
        "username": "tsadmin",
        "validity_time_in_sec": 3000,
        "org_id": 0,
        "password": "admin",
        "user_parameters": {
            "runtime_filters": [
                {
                    "column_name": "Color",
                    "operator": "IN",
                    "values": [
                        "red",
                        "green"
                    ],
                    "persist": True
                }
            ],
            "parameters": [],
            "runtime_sorts": []
        }
    })
    headers = {
        'accept': 'application/json',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'content-type': 'application/json',
        'origin': f"{domain}",
        'priority': 'u=1, i',
        'referer': f"{domain}",
        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site'
    }

    try:
        reachable = "TRUE"
        opt_resp = requests.request("OPTIONS", url, headers=headers, data=payload, verify=False, timeout=5)
        opt_resp.raise_for_status()  # Ensure we're raising for status on opt_resp

        if opt_resp.status_code == 204:
            return "PASS", reachable
        elif opt_resp.status_code == 404:
            return "FAIL", reachable
    except requests.exceptions.HTTPError as http_err:
        reachable = f"HTTP error occurred: {http_err}"
    except requests.exceptions.ConnectionError as conn_err:
        reachable = f"Connection error occurred: {conn_err}"
    except requests.exceptions.Timeout as timeout_err:
        reachable = f"Timeout error occurred: {timeout_err}"
    except requests.exceptions.RequestException as req_err:
        reachable = f"An error occurred: {req_err}"

    # Optionally print or log the error for debugging
    print("sandeep"+reachable)

    return "UNVERIFIED", reachable


def check_csp():
    url = f"{input_url}/callosum/v1/v2/auth/session/login"
    payload = 'username=tsadmin&password=secret&remember_me=false'
    headers = {
        # 'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        # 'Cookie': 'JSESSIONID=eb8aa5fa-1db1-4e54-81dd-92bdf8a94863; clientId=ccfba3bc-8adb-4505-9a69-be9988571ffc'
    }
    response = requests.request("POST", url, headers=headers, data=payload, verify=False)
    # print(response.text)
    # print(response.headers)
    # print(response.headers['Content-Security-Policy'])
    # print(type(response.headers))

    domain_match_list = [domain] # https://app.pendo.io

    domain_items = domain.split("//")
    protocol = domain_items[0] + "//"
    sub_domains = domain_items[1].split(".")

    post_suffix = ""
    for item in sub_domains[::-1]:
        suffix = item + post_suffix
        if suffix == domain_items[1]:
            break
        domain_match_list.append(protocol + "*." + suffix)
        post_suffix = "." + suffix
        #print(item)

    # domain_match_list.append("https://*.pendo.io")
    # domain_match_list.append("https://*.io")

    # print(domain_match_list)

    csp_content = response.headers['Content-Security-Policy']
    csp_status = "FAIL"
    for csp_item in csp_content.split(";"):
        csp_item = csp_item.strip()
        if csp_item.startswith("frame-ancestors"):
            for value in csp_item.split(" "):
                if value == "*":
                    csp_status = "PASS"
                    #print(value + " " + csp_item)
                    break
                elif value in domain_match_list:
                    csp_status = "PASS"
                    #print(value + " " + csp_item)
                    break

        # if domain not in csp_content:
        #     csp_status = "FAIL"

    return csp_status, csp_content


if __name__ == '__main__':
    cors_status, reachable = check_cors()
    response = {"thoughtspot_cluster": input_url, "Reachable": reachable, "embed_domain": domain, "cors_status": cors_status}



    if response["cors_status"] == "PASS":
        csp_status, csp_content = check_csp()
        response["csp_status"] = csp_status
        response["csp_content"] = csp_content
    else:
        response["csp_status"] = "UNVERIFIED"
        response["csp_content"] = ""

    print(response)
    
    #print(parsed_data)
    file_name = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), "../CorsCsp.txt"))
    #file_name = "/Users/tanmay.pani/codex/CorsCsp.txt"
    print(file_name)
    with open(file_name, "w") as json_file:
        json.dump(response, json_file)