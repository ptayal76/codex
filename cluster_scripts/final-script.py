import argparse
import http.client
import json
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path('.') / '.env'

# Load the .env file
load_dotenv(dotenv_path=env_path)
state_token = os.getenv('KIBANA_STATE_TOKEN')
refresh_token = os.getenv('KIBANA_REFRESH_TOKEN')
url = "https://vpc-cosmos-logs-4wtep3mnjhirrckhgaaqedsrtq.us-west-2.es.amazonaws.com/_plugin/kibana/internal/search/es"
conn = http.client.HTTPSConnection("vpc-cosmos-logs-4wtep3mnjhirrckhgaaqedsrtq.us-west-2.es.amazonaws.com")

produrl = "https://vpc-cosmos-logs-vtnxecylwjjggwhuqg66jqrw6y.us-east-1.es.amazonaws.com/_plugin/kibana/internal/search/es"
prodconn = http.client.HTTPSConnection("vpc-cosmos-logs-vtnxecylwjjggwhuqg66jqrw6y.us-east-1.es.amazonaws.com")
# Create the parser
parser = argparse.ArgumentParser(description="Arguments needed for filtering by clusterId, time interval for the logs and so on.")
# Add arguments
parser.add_argument("--cluster_id", type=str, help="cluster id", default="c03420ab-ba47-11ee-b0f5-6db5e")
parser.add_argument("--initial_time", type=str, help="initial time", default="2024-06-05T11:00:00.000Z")
parser.add_argument("--end_time", type=str, help="end time", default="2024-06-05T12:00:00.000Z")
parser.add_argument("--msg", type=str, help="debug message", default="")


args = parser.parse_args()
# Access the arguments
print(f"cluster id: {args.cluster_id}")
print(f"initial time: {args.initial_time}")
print(f"end time: {args.end_time}")
print(f"debug msg: {args.msg}")
payload = json.dumps({
    "params": {
        "index": "tenant-*",
        "body": {
            "version": True,
            "size": 2000,
            "sort": [
                {
                    "@timestamp": {
                        "order": "desc",
                        "unmapped_type": "boolean"
                    }
                }
            ],
            "aggs": {
                "2": {
                    "date_histogram": {
                        "field": "@timestamp",
                        "calendar_interval": "1h",
                        "time_zone": "UTC",
                        "min_doc_count": 1
                    }
                }
            },
            "stored_fields": [
                "*"
            ],
            "script_fields": {},
            "docvalue_fields": [
                {
                    "field": "@timestamp",
                    "format": "date_time"
                }
            ],
            "_source": {
                "excludes": [
                    "auto_complete"
                ]
            },
            "query": {
                "bool": {
                    "must": [],
                    "filter": [
                        {
                            "match_all": {}
                        },
                        {
                            "match_phrase": {
                                "cluster_id": "672764c0-dc60-11ee-a6bf-13c83"
                            }
                        },
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": "2024-03-01T00:00:00",
                                    "lte": "2024-06-01T00:00:00",
                                    "format": "strict_date_optional_time"
                                }
                            }
                        }
                    ],
                    "should": [],
                    "must_not": []
                }
            },
            "highlight": {
                "pre_tags": [
                    "@kibana-highlighted-field@"
                ],
                "post_tags": [
                    "@/kibana-highlighted-field@"
                ],
                "fields": {
                    "*": {}
                },
                "fragment_size": 2147483647
            }
        },
        "rest_total_hits_as_int": True,
        "ignore_unavailable": True,
        "ignore_throttled": True,
        "preference": 1717735704857,
        "timeout": "60000ms"
    }
})

headers = {
    'accept': '*/*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'content-type': 'application/json',
    'cookie': f'STATE-TOKEN={state_token}; REFRESH-TOKEN={refresh_token}',
    'kbn-version': '7.9.1',
    'origin': 'https://vpc-cosmos-logs-4wtep3mnjhirrckhgaaqedsrtq.us-west-2.es.amazonaws.com',
    'priority': 'u=1, i',
    'referer': 'https://vpc-cosmos-logs-4wtep3mnjhirrckhgaaqedsrtq.us-west-2.es.amazonaws.com/_plugin/kibana/app/discover',
    'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
}

conn.request("POST", "/_plugin/kibana/internal/search/es", payload, headers)
res = conn.getresponse()
data = res.read()
print(data.decode("utf-8"))
decoded_data = data.decode("utf-8")
parsed_data = json.loads(decoded_data)

file_name = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), "../Kibana.txt"))
print(file_name)
with open(file_name, "w") as json_file:
    #json.dump("{'key1':'val1', 'key2':'val2'}", json_file, indent=4)
    json.dump(parsed_data, json_file, indent=4)
# try:
#     # Sending the POST request with custom headers
#     response = requests.post(url, json=payload, headers=headers, timeout=10)  # 10 seconds timeout
#     # Checking if the request was successful (status code 200)
#     if response.status_code == 200:
#         print("POST request was successful!")
#         print("Response:", response.json())  # Printing the response from the server
#     else:
#         print("POST request failed with status code:", response.status_code)
# except ConnectionError as ce:
#     print("Connection Error:", 