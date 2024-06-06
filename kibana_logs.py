import argparse
import http.client
import json
url = "https://vpc-cosmos-logs-vtnxecylwjjggwhuqg66jqrw6y.us-east-1.es.amazonaws.com/_plugin/kibana/internal/search/es"
conn = http.client.HTTPSConnection("vpc-cosmos-logs-vtnxecylwjjggwhuqg66jqrw6y.us-east-1.es.amazonaws.com")
# Create the parser
parser = argparse.ArgumentParser(description="Arguments needed for filtering by clusterId, time interval for the logs and so on.")
# Add arguments
parser.add_argument("--cluster_id", type=str, help="cluster id", default="c03420ab-ba47-11ee-b0f5-6db5e")
parser.add_argument("--initial_time", type=str, help="initial time", default="2024-06-05T11:00:00.000Z")
parser.add_argument("--end_time", type=str, help="end time", default="2024-06-05T12:00:00.000Z")
parser.add_argument("--msg", type=str, help="debug message", default="")
parser.add_argument("--state_token", type=str, help="state token", default="467f62bd-7905-49ac-834e-b6bd4ea5798a")
parser.add_argument("--refresh_token", type=str, help="refresh token", default="eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.D2XWZu4FZKFgXuSVp-MmZLn0KC_gLUePlYS1buqiQ29Wf61UOJGsZRme90FDifB0HLJ785OafdVpZVyCv9vwPDblukdpsN6T_HDnrdZa-g3b5bc3LQShWpuSHj-jhTYx2gUvhlWYAvU2ksEEJh88yCNua-uarEQPf5yIbYYy3_ZyKsobjdoRBB44xmU9II-BxH37-1vYbUulRlqKq3cN0lXq-WcYzCoATvQLknuCdcjA6fjj_4twnpMcF5E1zk1ZifECuL_4LUCEV3zgcHZx6Xf6aHC1xJksK5tj2NRg8selcYdL2iTFRCGC_-s5abJlSbJZOApTJtngO9HeIyIzwA.Q3CSwRQc1nc7bIAN.txRmGCDgXHrV0ygAkylPdokyBoQfRD0b6wViTpRNbsEr7cbjCUxpNHHAtmE08faaB2UPJN65HT6Jx1WMW1aELQSw0XF3JYITA3kaWoEzuLlkHlm_uifyt6_zCqFBX8kMVAUWN2xLH44KPyt9ybOqByuj1zEMIFqjJ0M9W1fUniIkV9Z0sA0fvAx8nWaTY3_5ZgKgo7SnRVlebVXhpOcbugVRmtIimdY-93E8fT9t9zWVMKxEW02XZDR61otjLRBY8rHSkoX27_WWS8feSgd5M3eQweCHjeGB3zZj5IX0UXXxuwVQwAcGtu06F0k7KCs_FZdAeS_ngovsdE3yBmG5YK0H1zXSqkEprwuOweY166e1S9qOk8yM-ao6IJvdzbwn_jhepkdmX2hkw-CkeuqzAoyIQ-I7BP-ylAj1AikallpWNWVa-7rpDiRCX5TDMZJVf3Nbpf4XR9JwcbCfMS8UxlhjsmAGMQ3vzu5ShbFw21T1gJcccA34oKo6vNSr9cucpla7USrqgG7c7dnuUVBcytJfGAOj_Cw83XqaOSzkZUeZhVhVlpx8kh0kJP_3Zq8H1Hvqxs8eIlZdjrPT_Uwruw-KofDhwa-HYCN1jl-dqIxYdDMWQl3lycs1HEcFsP3fnKwokR0oN7laBkWTAgq5Zml9jIgl3RKyf_pAeR3uOCk_rAogiBjAT9N6mC0B5NWJqi3BUETuu0y8YvVRmNC769G6rbpveyMMCoAkWfCzFFVPhrXvgyPF1SfaqoxHKw1FazOVaZztWmsHEkCxizVGIpySzIxRAZW1kY06R-vpaiQZFJS_sIQFDuVU35IxT4wqZMhaWOHLnvSNQZG9p3EnIr9xWmGxAY1p7IsQ8JI7FbkN1xEg-cGC_FRh-bZbTPwH7miWQip6p05b3ygDZTSpxpKsZ5-qibjKKhKVLkAxz5Kpq220ElOhB6oKhBPa3EnTUKrxX9tgIvoL8fMtjJB30WX_lp7xZcrAIkS1YLxHpnOtESUKlK9MD1z6tmYNcoe3krUn1TIH6WueoZHXEvaO_sdaTJf-o2LFnJ1uy71kpDXj6d9yUFd7_QSzOlGkXafLnHRj-9QGZmYgygCphwBXGVlJpEKt14KYkLcxhqsLFNZW1O9hU98voLdtDOw3X7XoGORIkPb2M3r98XDjnI82KeeVF8ESa0vcQZmjwd7Gp9DV7qwgxWbqZCRb8w9MlKqWjFCWxGV-c_ndjOYSs0Gwd86KLMCoK7mmu4lI8pI.w3k0OA5lDs9eXhjKrCTV0g; COGNITO-ENABLED=True; ID-TOKEN=eyJraWQiOiJLc3Z3cjI5cnB5SUw2czM0eWhSY05WcWQ5KytXUGV0TzVMMDdHZnJYMWhFPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiUmJXbUNQQ09CNzA5QzVLWHBCN2ZsZyIsInN1YiI6IjgyZmMxNjZkLWJjNDEtNDBjNi05YmVhLTU0NGJlMTA5MzM0YSIsImNvZ25pdG86Z3JvdXBzIjpbInVzLWVhc3QtMV9QRk84UTZldnZfT2t0YS1PSURDIl0sImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfUEZPOFE2ZXZ2IiwiY29nbml0bzp1c2VybmFtZSI6Ik9rdGEtT0lEQ18wMHVzM3hoMzJrYllWNVh1bjB4NyIsIm9yaWdpbl9qdGkiOiJkMDBjNmI3ZC03OTk2LTRmYjYtOGE2OC0zYzhkNTczYzM5ZTciLCJhdWQiOiIyaHQ2aDc1dWdiNW9uMGtpMXM3ZGd1amhwciIsImlkZW50aXRpZXMiOlt7InVzZXJJZCI6IjAwdXMzeGgzMmtiWVY1WHVuMHg3IiwicHJvdmlkZXJOYW1lIjoiT2t0YS1PSURDIiwicHJvdmlkZXJUeXBlIjoiT0lEQyIsImlzc3VlciI6bnVsbCwicHJpbWFyeSI6InRydWUiLCJkYXRlQ3JlYXRlZCI6IjE2NDk0MDM5OTExOTIifV0sInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzE1MDYxMTIyLCJleHAiOjE3MTc1NzQ2MDIsImlhdCI6MTcxNzU3MTAwMiwianRpIjoiZjRjMzRhODUtMjZiYy00MWUwLWIzNTItYmZmYjhmNDNlNjljIiwiZW1haWwiOiJhbmFuZC5wdXNocHJhakB0aG91Z2h0c3BvdC5jb20ifQ.J5MeLAdufqCbZt4STuqhn92yvOoqKyNJsm1-bQaHoZ0A2U3q73yrvc-ETua-P8n-EinauwARbjH_FEhMDdogtUPUJuZefBdO642B3rlOvAMdgcj9_agDR67-cqPOGyn9owu3vCkpVR-6fkfmXQVQoqk2R-58fSw5sp4gflJPvoQl9SNUchkIX1X6JMSCb5vw94yf3ywvERLrpHk-ofbYZbgPNQYdpz7Bhnrm3psAeNAk41x89UvyCWHC-03i2vLWYtpTA-_7UVdWMsYqKuuskPmXZp_YIkZJlL6WOy0NZ_lLOSxwiMlMsah65pSHSiLaJY5wVdqelGsXp1wSa7BktA; ACCESS-TOKEN=eyJraWQiOiJ0ekl5akRCYk5sSlFIcU1lTGxNSFJqbGxEZ3JqVzBXK0NpdWxnelpNUkRvPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4MmZjMTY2ZC1iYzQxLTQwYzYtOWJlYS01NDRiZTEwOTMzNGEiLCJjb2duaXRvOmdyb3VwcyI6WyJ1cy1lYXN0LTFfUEZPOFE2ZXZ2X09rdGEtT0lEQyJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9QRk84UTZldnYiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIyaHQ2aDc1dWdiNW9uMGtpMXM3ZGd1amhwciIsIm9yaWdpbl9qdGkiOiJkMDBjNmI3ZC03OTk2LTRmYjYtOGE2OC0zYzhkNTczYzM5ZTciLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6InBob25lIG9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXV0aF90aW1lIjoxNzE1MDYxMTIyLCJleHAiOjE3MTc1NzQ2MDIsImlhdCI6MTcxNzU3MTAwMiwianRpIjoiZDFjNTBmNDQtMTI1YS00NThjLThiMjMtNmM3ZDRhZjdhYjRiIiwidXNlcm5hbWUiOiJPa3RhLU9JRENfMDB1czN4aDMya2JZVjVYdW4weDcifQ.A1kQul5grci1UpdTXBznx6El1PJ73SwCMnb2YmSLdvlMMyI-2nZ_-BLLVFyntvtMe0w1rF5Vrif31jg-nQwq7coTqbVzQeXDh41ClJjoZ1kDcUuVgUwQT4ngvEw3ygVvbH-vzLOF0v64Q-bp_2DVtJLCWM9PTVswf2i7Cm-ChP1LPJlDhiJWLNY94NMSmUQOrZyBmyjKhP6iN6kPCewqz2jZbt-cv4kgp_qO06qEkebuCtRJ2Ld3sKplvMQtBbH_X2dYaSafwvFFiJG4peu7gtvBXOFHIB3W1VkeO_CVDwNO9eKCd0pADLX4VZ_jpkBkgYbY5fwsJetlwRiu2xPWYA; ACCESS-TOKEN=eyJraWQiOiJ0ekl5akRCYk5sSlFIcU1lTGxNSFJqbGxEZ3JqVzBXK0NpdWxnelpNUkRvPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4MmZjMTY2ZC1iYzQxLTQwYzYtOWJlYS01NDRiZTEwOTMzNGEiLCJjb2duaXRvOmdyb3VwcyI6WyJ1cy1lYXN0LTFfUEZPOFE2ZXZ2X09rdGEtT0lEQyJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9QRk84UTZldnYiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIyaHQ2aDc1dWdiNW9uMGtpMXM3ZGd1amhwciIsIm9yaWdpbl9qdGkiOiJkMDBjNmI3ZC03OTk2LTRmYjYtOGE2OC0zYzhkNTczYzM5ZTciLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6InBob25lIG9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXV0aF90aW1lIjoxNzE1MDYxMTIyLCJleHAiOjE3MTc1ODQxMDAsImlhdCI6MTcxNzU4MDUwMCwianRpIjoiNDk0M2VhZDItMzRmOS00YTBkLTkxZDItNzk3MjY4ZTQwMTE4IiwidXNlcm5hbWUiOiJPa3RhLU9JRENfMDB1czN4aDMya2JZVjVYdW4weDcifQ.FoKmhPZ0Wa5VRuxyxgIDiTjei70IAMyr_qUfnCYoAAjaUlzlryahkZYHLXLj6CXHq8oKr-K6OYtlbC-HGH6PReE-891V_Hx2r_1xy1iADCtXYSEdk8lhU7O2dYZ3DNa3ZfJ8CMsQFxD_GP786QoNciedBVTiEFmnb9SoBDosmvg4qAe3FIfhu5psMvYza3K0XrzFeGFsGfs3rcMZd1yejTzs1jj5zKdq-cDozi50zKVYIos08uLddptqXeTu7uBQhejHOpzW_NgynfQjP9wJTJld3kDMPwcyXNPKFdANCZR1Wxpofbet2jhDVBeCpocLV4T-WpDF1vKEm5Q_7O_WWw; COGNITO-ENABLED=True; ID-TOKEN=eyJraWQiOiJLc3Z3cjI5cnB5SUw2czM0eWhSY05WcWQ5KytXUGV0TzVMMDdHZnJYMWhFPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiQjAxb2pYWVptMy03TDRPaGhQLWowZyIsInN1YiI6IjgyZmMxNjZkLWJjNDEtNDBjNi05YmVhLTU0NGJlMTA5MzM0YSIsImNvZ25pdG86Z3JvdXBzIjpbInVzLWVhc3QtMV9QRk84UTZldnZfT2t0YS1PSURDIl0sImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfUEZPOFE2ZXZ2IiwiY29nbml0bzp1c2VybmFtZSI6Ik9rdGEtT0lEQ18wMHVzM3hoMzJrYllWNVh1bjB4NyIsIm9yaWdpbl9qdGkiOiJkMDBjNmI3ZC03OTk2LTRmYjYtOGE2OC0zYzhkNTczYzM5ZTciLCJhdWQiOiIyaHQ2aDc1dWdiNW9uMGtpMXM3ZGd1amhwciIsImlkZW50aXRpZXMiOlt7InVzZXJJZCI6IjAwdXMzeGgzMmtiWVY1WHVuMHg3IiwicHJvdmlkZXJOYW1lIjoiT2t0YS1PSURDIiwicHJvdmlkZXJUeXBlIjoiT0lEQyIsImlzc3VlciI6bnVsbCwicHJpbWFyeSI6InRydWUiLCJkYXRlQ3JlYXRlZCI6IjE2NDk0MDM5OTExOTIifV0sInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzE1MDYxMTIyLCJleHAiOjE3MTc1ODQxMDAsImlhdCI6MTcxNzU4MDUwMCwianRpIjoiMmM2YWJmZjQtZWE5MS00YzZjLWFiZTEtMGQ3NDRjZWNiODQwIiwiZW1haWwiOiJhbmFuZC5wdXNocHJhakB0aG91Z2h0c3BvdC5jb20ifQ.K88ow-gHQPRYGZ89BtGBFIbr9rkMT1EW91rF0eT3smJuMlJJpKdi7FMY-iiJwVhqMXRJ6kaUGbrjplARNOVcX6XzRxfsyLvQDnuD-qICBc7fgw_asYLXXJB8B4QbMFFTD4iooeh7BF7taUEWEfOXkgHRoX5qsSfDm41J5j0ZeO2zTxxDi1ueTiUJaNG1RQa5A4oxpWA8DPRf36q7hpLrNYFX5zGY1dDLiDyhV2IeEc5YguCstoFOhUzE60yg-G1Kc-dFppZfRwOoGFbhlNQZcYTW8FbdlBOkvfdIlFmy4KzcIQQYqV-wgIhjOhpmD80H3kyVPS_tqnyHk3SpNiD99Q; REFRESH-TOKEN=eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.D2XWZu4FZKFgXuSVp-MmZLn0KC_gLUePlYS1buqiQ29Wf61UOJGsZRme90FDifB0HLJ785OafdVpZVyCv9vwPDblukdpsN6T_HDnrdZa-g3b5bc3LQShWpuSHj-jhTYx2gUvhlWYAvU2ksEEJh88yCNua-uarEQPf5yIbYYy3_ZyKsobjdoRBB44xmU9II-BxH37-1vYbUulRlqKq3cN0lXq-WcYzCoATvQLknuCdcjA6fjj_4twnpMcF5E1zk1ZifECuL_4LUCEV3zgcHZx6Xf6aHC1xJksK5tj2NRg8selcYdL2iTFRCGC_-s5abJlSbJZOApTJtngO9HeIyIzwA.Q3CSwRQc1nc7bIAN.txRmGCDgXHrV0ygAkylPdokyBoQfRD0b6wViTpRNbsEr7cbjCUxpNHHAtmE08faaB2UPJN65HT6Jx1WMW1aELQSw0XF3JYITA3kaWoEzuLlkHlm_uifyt6_zCqFBX8kMVAUWN2xLH44KPyt9ybOqByuj1zEMIFqjJ0M9W1fUniIkV9Z0sA0fvAx8nWaTY3_5ZgKgo7SnRVlebVXhpOcbugVRmtIimdY-93E8fT9t9zWVMKxEW02XZDR61otjLRBY8rHSkoX27_WWS8feSgd5M3eQweCHjeGB3zZj5IX0UXXxuwVQwAcGtu06F0k7KCs_FZdAeS_ngovsdE3yBmG5YK0H1zXSqkEprwuOweY166e1S9qOk8yM-ao6IJvdzbwn_jhepkdmX2hkw-CkeuqzAoyIQ-I7BP-ylAj1AikallpWNWVa-7rpDiRCX5TDMZJVf3Nbpf4XR9JwcbCfMS8UxlhjsmAGMQ3vzu5ShbFw21T1gJcccA34oKo6vNSr9cucpla7USrqgG7c7dnuUVBcytJfGAOj_Cw83XqaOSzkZUeZhVhVlpx8kh0kJP_3Zq8H1Hvqxs8eIlZdjrPT_Uwruw-KofDhwa-HYCN1jl-dqIxYdDMWQl3lycs1HEcFsP3fnKwokR0oN7laBkWTAgq5Zml9jIgl3RKyf_pAeR3uOCk_rAogiBjAT9N6mC0B5NWJqi3BUETuu0y8YvVRmNC769G6rbpveyMMCoAkWfCzFFVPhrXvgyPF1SfaqoxHKw1FazOVaZztWmsHEkCxizVGIpySzIxRAZW1kY06R-vpaiQZFJS_sIQFDuVU35IxT4wqZMhaWOHLnvSNQZG9p3EnIr9xWmGxAY1p7IsQ8JI7FbkN1xEg-cGC_FRh-bZbTPwH7miWQip6p05b3ygDZTSpxpKsZ5-qibjKKhKVLkAxz5Kpq220ElOhB6oKhBPa3EnTUKrxX9tgIvoL8fMtjJB30WX_lp7xZcrAIkS1YLxHpnOtESUKlK9MD1z6tmYNcoe3krUn1TIH6WueoZHXEvaO_sdaTJf-o2LFnJ1uy71kpDXj6d9yUFd7_QSzOlGkXafLnHRj-9QGZmYgygCphwBXGVlJpEKt14KYkLcxhqsLFNZW1O9hU98voLdtDOw3X7XoGORIkPb2M3r98XDjnI82KeeVF8ESa0vcQZmjwd7Gp9DV7qwgxWbqZCRb8w9MlKqWjFCWxGV-c_ndjOYSs0Gwd86KLMCoK7mmu4lI8pI.w3k0OA5lDs9eXhjKrCTV0g")
# Parse the arguments
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
    'cookie': 'STATE-TOKEN=' + args.state_token + ';' + 'REFRESH-TOKEN=' + args.refresh_token,
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
#     print("Connection Error:", ce)

