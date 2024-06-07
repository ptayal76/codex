import argparse
import http.client
import json
import os

url = "https://vpc-cosmos-logs-vtnxecylwjjggwhuqg66jqrw6y.us-east-1.es.amazonaws.com/_plugin/kibana/internal/search/es"
conn = http.client.HTTPSConnection("vpc-cosmos-logs-vtnxecylwjjggwhuqg66jqrw6y.us-east-1.es.amazonaws.com")
# Create the parser
parser = argparse.ArgumentParser(description="Arguments needed for filtering by clusterId, time interval for the logs and so on.")
# Add arguments
parser.add_argument("--cluster_id", type=str, help="cluster id", default="c03420ab-ba47-11ee-b0f5-6db5e")
parser.add_argument("--initial_time", type=str, help="initial time", default="2024-06-05T11:00:00.000Z")
parser.add_argument("--end_time", type=str, help="end time", default="2024-06-05T12:00:00.000Z")
parser.add_argument("--msg", type=str, help="debug message", default="")

# Parse the arguments
state_token="20768bc6-99a0-4194-921b-e7d9b21160af"
refresh_token= "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.EXmUErFbyJysD-GXgNEetxNyvyMCZW9cgmT7gs_9JjFy93PrfP599-7gSbvUgdumVQ0numHI1OWugDtrly4LQLh9IevrsvK2GeWvh8S_OH1bJo_zgy2wqPX5lfLZUWgV3-NpC_ijkpE0SgIgzTNA_7MgGs2_6lC36aa7v4ntGu_yQWIrtKrp8AErFDnHA2TMnmWbA2ZLdUoJWLPMLJ9bdbUDQPvB1RGnLfpQU94HuGQqHlODEY5DpNG5wDBI9Ipzyrhy4BAGFQPz6HO_Om-MIGnuS5TibU5s8uiMayNBnfN6ozLT7A3n1HO1N1nK_zlL77L5YJajzwaeskTlGHu_Fw.y2DWyr16_FeT5IEB.tLXfndFAUU_s6JMZGv-_0Kh1adMvIlwo8GzY8nW97yKivn1DrJTGFT0MRGaYmQ8gRljVZiNkczNtlLtYkKEVAs0KvN614eNbGm_764KCJIjKhxqXam5V5iF-KUN2k90wmqRpsSfCREGatpLIgICSPe57WDnhCwxwKIPJpA0bd0IyAh2zjO0Q1P56nsQP85wCA1otTkybDjrFjDZEiAY4aQhQg41ZsSnOliWY8w6z8_0mpu-l8f7dByZPqrZF_9QkJ_8IjJbpzqWrMU4nSfue3IrpgeKiU-FumTVbqYxeIPoOuOgRRJLXQH0Hxe-B-Aw7QLWeWxax-xe31g0f-avuNAI4ibRc1Igwafp-CUBkR9XoBcIR9faEL5xz8OYJZL-NZyI4M_uBRG8D1BbrFwjzRnXsmMvo_5D6gImw16VbDPu6u35CCQR10KroglZveJrU1JVuldBg7HGJvIacHBqXRsmS3mOXDHX2ezmqg7L-UPMSRRWV1fcV9WIFCs2fPaOvQJBmZnwqEZaMteHtIJFxV5BQg5FX3ZmJxIPmRetaifi916A7gtPoQsRu1bWrUg-3uSP2Ual7wZhdGDF0HsIftwXXWw4kYq9kNPrpVjanvi3DNdOrakeDRmh4hpXDBUaTej40QnUZgFuvuG-XDJTqhwRHOxrN-HLpcOd5LegNX6D9-XcmJ5094G97QoNkLCRXhLi19m0HIFjgIPDiZBl2stSmnPB2RiChZUlvHx5ud4r-rH2mZg15l3jATC_Borag6DyBrcIYHghBE1ecX9Ua72LkLTv3n0QuOe_SR_7kguwVXALgVGV1Ir0A1YR58s3q2v8NEX4xF54FkR8c0ZbmMNgEBgQtatioGxCyewZ7bk-ZovRi90CD_y-j4DrZT4UsnSwUSQSJ33hBEBJTaD2seYCwU26tWFHokT6yQkDnn9qOtBo2uvuJeLyf69N09o8i0AQthgVzClun-pZ9RDHu3EVcXHW1Cu3wpJgNqrukMS-6xLu7o4nrcJsWiGr7bc4MPh7CCBYlsQ1UGQtWQ-HLBoq221CqWvgSL-TNQvwRCgZWqGTUAd_6x9AA0UrLrPH5r9Sd08QryW8iZolhYhAw3if-tTVeQxJHO9E64DAc36raqJxL3mw1vuxpOV4cyTGTrbxyZuC2anwPq2ng8y3TMfBZMI-Ydm6l9X1L6Zr9lgU72Matkba5Im-aof00QRCm3Ky6bsNI1LgdwPhVcq_aXoKiv4bRyKL869KNgkM.YrO96qAwU_aGqu8TY0IlLQ"
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
                        "fixed_interval": "30s",
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
                "excludes": []
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
                                "cluster_id": args.cluster_id
                            }
                        },
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": args.initial_time,
                                    "lte": args.end_time,
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
        "preference": 1717571424696,
        "timeout": "60000ms"
    }
})
headers = {
    'accept': '*/*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    'cookie': 'STATE-TOKEN=' + state_token + ';' + 'REFRESH-TOKEN=' +refresh_token,
    'kbn-version': '7.9.1',
    'origin': 'https://vpc-cosmos-logs-vtnxecylwjjggwhuqg66jqrw6y.us-east-1.es.amazonaws.com',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'referer': 'https://vpc-cosmos-logs-vtnxecylwjjggwhuqg66jqrw6y.us-east-1.es.amazonaws.com/_plugin/kibana/app/discover',
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