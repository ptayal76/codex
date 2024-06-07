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
                                "cluster_id": "3d23a190-ccdc-11ed-8a31-4d8aa"
                            }
                        },
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": "2024-06-05T03:36:56.940Z",
                                    "lte": "2024-06-07T03:36:56.940Z",
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
        "preference": 1717730165128,
        "timeout": "60000ms"
    }
})

headers = {
    'accept': '*/*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'content-type': 'application/json',
    'cookie': 'STATE-TOKEN=558cf867-0211-4b2b-aa8f-392fb93e3ce0; REFRESH-TOKEN=eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.Y5b9DOHCaXWy4WJ_TlhpGXgUsjxN0ACklM0A12a8PjQvaomYyTiqe-4VHW7jBycLdfDr-oovMo9v4cUUQQJj2UA90zskOB71vNhXtT5cNQX9Aqud1jVG-guoyR4pbhyTbkvwhP4FU13REr5lXXgDk64Uvj-2YbTuyXDOJsBwR7gIwQlF8SY7l9gIsPcf7mki-EiBJ_sd8vFsBTq_uztkpXhLpzLhR1Rh3D86-j7mAbCsERXoPlqq2DX-m3efRLM1sc-iGFbgK_uhUo4o3WbKksuIUa2zfyID61pEP-zcT1Iea3HMmdtBSjFfNXPT6BB8jeBt4hVqTGSmL-MWAVJr0w.qbmz0ISz72X2iFFy.mw2nUng_X2_oP9BKsOHueQw75wxP1_VkrG5j9WQqT9WAk_7PmvknFMseSeW5ZBRFg328fWMYGYnn0oii_6Y0wKEqR7owbQPksYO3OGfaiqLUJJkb-FOUPlF7Hqor4lk6huv-Vl33fp3Ad1NTV9gXNFvgZURuTlVkU7Uu8X5M2LyxdmZ0g5glZ_7ENT2tGopAU7ZjibCPLDNdqaI0y3cuM5zVJ2n-mqh7-GrAz6a7zdikPceIJsFNSU_pf7JNLBuapAHcVlxYyZv06gAJfdbxD0-tz7lrFzL3STUdHfetpEjdeRPLQYavBzQmlEO0Yvyw_SeUhYilr9tvSuvm2TRMwXnBzE0zJpRdvm7LvieD4Htj-71sV5lRVjEppetw-Z_tSrc1m2nE_va80YF6aE75i8DTxIsrXCWtuFYXwVhAm-YcBbavpBzhxXUjWd8kTCIlRBm8Qf-2UuPPLQyVj7xZOdw86GR73qxg_SaGY-EwIUryoTEntUa8iIehm5DGY-MQUwRXl8u7dtlMItDLyQTEMRm8cCh8cyp4mBMyAuK42mzwg1CgH__P0UNf30jSOEhdX2X28_-DFcdMK_ScLcSQJ3hjjHtkLk87BhTKe3nnJevv7hYlgqkObi2fBZEVSgn4ZL_zZYxelXWctVyFsQiTpXZOXG0BbRSCetjB_efc9O192qaU_IHKh_TZMhkUOxo9ealRxvfRM_uVHXO9JvEh6pDoUXuL6D2zeUbueW6ubOR3RAPFTFq81-p3xtm3aw3FYrXK_AaFcV9YtMhhVjADjnN8GM9liVe01ybMqOGk5c8K08ngNwtFgjLcLmA7QY3T58ZkYdYDtNm7tgogDvI3n8Na_mDW-Y2tg7wml3Xj-TBOeY1Alq-zShdapjwDcnOcvLJ-nhj5lVJfnaD5xi6ruBuIjlM9eibluOO04D5BaYqzHkJDspmFk-o0KDQSdUwswPEjh7FMuTCt_rH9yyUdO9dRej7BsXeDrH5r9iXSddP3xPBGwX4w4uK0orFOO8xeZhM7P8JjPorHsASUkQStcmJwHj8I13cW2Y79gdJnasqCKVPyoS50t_SZCD3UxH9JhYigB_2emiw_3NmAIxLMFoirfQiJVkxyQDsjswl7-pMc8op_k3c8Q529BCM73oeZ_-vJinjyndsIaOwWnvW7TjRdfZwiqSvWgoiD3jMCONQcTAAUryQECvR1AhX2jEhfKSAMsHVklvm2fJ1hdYKeLP5-OSFZnpJpnW9zHoQ.p0lAhXdG4w0SkhBPrHVS-w; COGNITO-ENABLED=True; ID-TOKEN=eyJraWQiOiJLc3Z3cjI5cnB5SUw2czM0eWhSY05WcWQ5KytXUGV0TzVMMDdHZnJYMWhFPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiN21UY2FQVHNJZkkwZmY5ZjVaMi1KQSIsInN1YiI6ImM1NWFmYzE0LWY0MzUtNDQ1OS05NzVjLTgyNmFkMzQwMGQ0YiIsImNvZ25pdG86Z3JvdXBzIjpbInVzLWVhc3QtMV9QRk84UTZldnZfT2t0YS1PSURDIl0sImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfUEZPOFE2ZXZ2IiwiY29nbml0bzp1c2VybmFtZSI6Ik9rdGEtT0lEQ18wMHVxb3kyNmdyWlhDdHh0NzB4NyIsIm9yaWdpbl9qdGkiOiI2ZjNiM2E4ZC0yNDNjLTQ4NTYtYWE1MC0wZDBjZGY1YmQ3YzkiLCJhdWQiOiIyaHQ2aDc1dWdiNW9uMGtpMXM3ZGd1amhwciIsImlkZW50aXRpZXMiOlt7InVzZXJJZCI6IjAwdXFveTI2Z3JaWEN0eHQ3MHg3IiwicHJvdmlkZXJOYW1lIjoiT2t0YS1PSURDIiwicHJvdmlkZXJUeXBlIjoiT0lEQyIsImlzc3VlciI6bnVsbCwicHJpbWFyeSI6InRydWUiLCJkYXRlQ3JlYXRlZCI6IjE2ODc0NTEyNTY2NTAifV0sInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzE3MzkwNDY3LCJleHAiOjE3MTc3MzM3NjAsImlhdCI6MTcxNzczMDE2MCwianRpIjoiMjIyOGRjMTUtMzE4Mi00ZjhmLWI4OWUtYWJlMmM5MjExMGZlIiwiZW1haWwiOiJzYW5kZWVwLnlhZGF2QHRob3VnaHRzcG90LmNvbSJ9.NEJDCWrFTUZAAlQ24RZ_u_4xkWZNh-WDfTceOw-7WYTJWcn-ICDLgdvchWefU-VKT26bmfDjQIkbwdtq2eLtokB1Bnw0iWBStNX1J-DCuXSR3A1DzPor_ijP9gWaMfNAocuXarT87DkL5mPL8AFAnjD1Z-WjtYfXa7rDcu3t_5pPizTVNKVhYgDJzd4zOS-e2zn_qc6i7lZXhfdkcb6Zpiui8iiV3D0TLo9a6A603IFuGn8ad2f7AuwdYcES-5R-hx6du18e-FsqTrpgqHRggGettRAnifH06Dtwi5jya2XUs0Tlf0Kl4kL5EbszeqirIDF2N7JU8PXwubo9VpPy7Q; ACCESS-TOKEN=eyJraWQiOiJ0ekl5akRCYk5sSlFIcU1lTGxNSFJqbGxEZ3JqVzBXK0NpdWxnelpNUkRvPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjNTVhZmMxNC1mNDM1LTQ0NTktOTc1Yy04MjZhZDM0MDBkNGIiLCJjb2duaXRvOmdyb3VwcyI6WyJ1cy1lYXN0LTFfUEZPOFE2ZXZ2X09rdGEtT0lEQyJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9QRk84UTZldnYiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIyaHQ2aDc1dWdiNW9uMGtpMXM3ZGd1amhwciIsIm9yaWdpbl9qdGkiOiI2ZjNiM2E4ZC0yNDNjLTQ4NTYtYWE1MC0wZDBjZGY1YmQ3YzkiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6InBob25lIG9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXV0aF90aW1lIjoxNzE3MzkwNDY3LCJleHAiOjE3MTc3MzM3NjAsImlhdCI6MTcxNzczMDE2MCwianRpIjoiODk0ZmEyMTItNzdhNy00YjIyLWJlNDgtNTE5YzNjZmFjZDI5IiwidXNlcm5hbWUiOiJPa3RhLU9JRENfMDB1cW95MjZnclpYQ3R4dDcweDcifQ.Sf1TG-1yPdnbPZbXWIXzR6zVz00rjO5gapKhxkzNPWYFDC4ArIwb6zAtebPq2IAAC0tZC-YB8gAkqjSbqK5SsgUa-JZCQvxRAa-Gs6izUfghVWGorfGV-nzYsjwr8khk5NdYZ3bUBcQSVACIrAiydnMkKHzLMHALoqI39c8QLwphXhpnxKaI0wCmCNMmtYQ_ZDeTXImxJBna_yBQe6naclInNSFbsolvc_naP1zCBXDvWFH6sSLzhc6dSDLNFcW3_VElUgfxzEZVpD9ar6NvN7-dy07Z8kXwa4vVjJJ46d8CJVhOlxYttDR2SfwpjugdCxY54XqalLEhSRmTu9VcUw; ACCESS-TOKEN=eyJraWQiOiJ0ekl5akRCYk5sSlFIcU1lTGxNSFJqbGxEZ3JqVzBXK0NpdWxnelpNUkRvPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjNTVhZmMxNC1mNDM1LTQ0NTktOTc1Yy04MjZhZDM0MDBkNGIiLCJjb2duaXRvOmdyb3VwcyI6WyJ1cy1lYXN0LTFfUEZPOFE2ZXZ2X09rdGEtT0lEQyJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9QRk84UTZldnYiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIyaHQ2aDc1dWdiNW9uMGtpMXM3ZGd1amhwciIsIm9yaWdpbl9qdGkiOiI2ZjNiM2E4ZC0yNDNjLTQ4NTYtYWE1MC0wZDBjZGY1YmQ3YzkiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6InBob25lIG9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXV0aF90aW1lIjoxNzE3MzkwNDY3LCJleHAiOjE3MTc3MzM3NjAsImlhdCI6MTcxNzczMDE2MCwianRpIjoiODk0ZmEyMTItNzdhNy00YjIyLWJlNDgtNTE5YzNjZmFjZDI5IiwidXNlcm5hbWUiOiJPa3RhLU9JRENfMDB1cW95MjZnclpYQ3R4dDcweDcifQ.Sf1TG-1yPdnbPZbXWIXzR6zVz00rjO5gapKhxkzNPWYFDC4ArIwb6zAtebPq2IAAC0tZC-YB8gAkqjSbqK5SsgUa-JZCQvxRAa-Gs6izUfghVWGorfGV-nzYsjwr8khk5NdYZ3bUBcQSVACIrAiydnMkKHzLMHALoqI39c8QLwphXhpnxKaI0wCmCNMmtYQ_ZDeTXImxJBna_yBQe6naclInNSFbsolvc_naP1zCBXDvWFH6sSLzhc6dSDLNFcW3_VElUgfxzEZVpD9ar6NvN7-dy07Z8kXwa4vVjJJ46d8CJVhOlxYttDR2SfwpjugdCxY54XqalLEhSRmTu9VcUw; COGNITO-ENABLED=True; ID-TOKEN=eyJraWQiOiJLc3Z3cjI5cnB5SUw2czM0eWhSY05WcWQ5KytXUGV0TzVMMDdHZnJYMWhFPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiN21UY2FQVHNJZkkwZmY5ZjVaMi1KQSIsInN1YiI6ImM1NWFmYzE0LWY0MzUtNDQ1OS05NzVjLTgyNmFkMzQwMGQ0YiIsImNvZ25pdG86Z3JvdXBzIjpbInVzLWVhc3QtMV9QRk84UTZldnZfT2t0YS1PSURDIl0sImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfUEZPOFE2ZXZ2IiwiY29nbml0bzp1c2VybmFtZSI6Ik9rdGEtT0lEQ18wMHVxb3kyNmdyWlhDdHh0NzB4NyIsIm9yaWdpbl9qdGkiOiI2ZjNiM2E4ZC0yNDNjLTQ4NTYtYWE1MC0wZDBjZGY1YmQ3YzkiLCJhdWQiOiIyaHQ2aDc1dWdiNW9uMGtpMXM3ZGd1amhwciIsImlkZW50aXRpZXMiOlt7InVzZXJJZCI6IjAwdXFveTI2Z3JaWEN0eHQ3MHg3IiwicHJvdmlkZXJOYW1lIjoiT2t0YS1PSURDIiwicHJvdmlkZXJUeXBlIjoiT0lEQyIsImlzc3VlciI6bnVsbCwicHJpbWFyeSI6InRydWUiLCJkYXRlQ3JlYXRlZCI6IjE2ODc0NTEyNTY2NTAifV0sInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzE3MzkwNDY3LCJleHAiOjE3MTc3MzM3NjAsImlhdCI6MTcxNzczMDE2MCwianRpIjoiMjIyOGRjMTUtMzE4Mi00ZjhmLWI4OWUtYWJlMmM5MjExMGZlIiwiZW1haWwiOiJzYW5kZWVwLnlhZGF2QHRob3VnaHRzcG90LmNvbSJ9.NEJDCWrFTUZAAlQ24RZ_u_4xkWZNh-WDfTceOw-7WYTJWcn-ICDLgdvchWefU-VKT26bmfDjQIkbwdtq2eLtokB1Bnw0iWBStNX1J-DCuXSR3A1DzPor_ijP9gWaMfNAocuXarT87DkL5mPL8AFAnjD1Z-WjtYfXa7rDcu3t_5pPizTVNKVhYgDJzd4zOS-e2zn_qc6i7lZXhfdkcb6Zpiui8iiV3D0TLo9a6A603IFuGn8ad2f7AuwdYcES-5R-hx6du18e-FsqTrpgqHRggGettRAnifH06Dtwi5jya2XUs0Tlf0Kl4kL5EbszeqirIDF2N7JU8PXwubo9VpPy7Q; REFRESH-TOKEN=eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.Y5b9DOHCaXWy4WJ_TlhpGXgUsjxN0ACklM0A12a8PjQvaomYyTiqe-4VHW7jBycLdfDr-oovMo9v4cUUQQJj2UA90zskOB71vNhXtT5cNQX9Aqud1jVG-guoyR4pbhyTbkvwhP4FU13REr5lXXgDk64Uvj-2YbTuyXDOJsBwR7gIwQlF8SY7l9gIsPcf7mki-EiBJ_sd8vFsBTq_uztkpXhLpzLhR1Rh3D86-j7mAbCsERXoPlqq2DX-m3efRLM1sc-iGFbgK_uhUo4o3WbKksuIUa2zfyID61pEP-zcT1Iea3HMmdtBSjFfNXPT6BB8jeBt4hVqTGSmL-MWAVJr0w.qbmz0ISz72X2iFFy.mw2nUng_X2_oP9BKsOHueQw75wxP1_VkrG5j9WQqT9WAk_7PmvknFMseSeW5ZBRFg328fWMYGYnn0oii_6Y0wKEqR7owbQPksYO3OGfaiqLUJJkb-FOUPlF7Hqor4lk6huv-Vl33fp3Ad1NTV9gXNFvgZURuTlVkU7Uu8X5M2LyxdmZ0g5glZ_7ENT2tGopAU7ZjibCPLDNdqaI0y3cuM5zVJ2n-mqh7-GrAz6a7zdikPceIJsFNSU_pf7JNLBuapAHcVlxYyZv06gAJfdbxD0-tz7lrFzL3STUdHfetpEjdeRPLQYavBzQmlEO0Yvyw_SeUhYilr9tvSuvm2TRMwXnBzE0zJpRdvm7LvieD4Htj-71sV5lRVjEppetw-Z_tSrc1m2nE_va80YF6aE75i8DTxIsrXCWtuFYXwVhAm-YcBbavpBzhxXUjWd8kTCIlRBm8Qf-2UuPPLQyVj7xZOdw86GR73qxg_SaGY-EwIUryoTEntUa8iIehm5DGY-MQUwRXl8u7dtlMItDLyQTEMRm8cCh8cyp4mBMyAuK42mzwg1CgH__P0UNf30jSOEhdX2X28_-DFcdMK_ScLcSQJ3hjjHtkLk87BhTKe3nnJevv7hYlgqkObi2fBZEVSgn4ZL_zZYxelXWctVyFsQiTpXZOXG0BbRSCetjB_efc9O192qaU_IHKh_TZMhkUOxo9ealRxvfRM_uVHXO9JvEh6pDoUXuL6D2zeUbueW6ubOR3RAPFTFq81-p3xtm3aw3FYrXK_AaFcV9YtMhhVjADjnN8GM9liVe01ybMqOGk5c8K08ngNwtFgjLcLmA7QY3T58ZkYdYDtNm7tgogDvI3n8Na_mDW-Y2tg7wml3Xj-TBOeY1Alq-zShdapjwDcnOcvLJ-nhj5lVJfnaD5xi6ruBuIjlM9eibluOO04D5BaYqzHkJDspmFk-o0KDQSdUwswPEjh7FMuTCt_rH9yyUdO9dRej7BsXeDrH5r9iXSddP3xPBGwX4w4uK0orFOO8xeZhM7P8JjPorHsASUkQStcmJwHj8I13cW2Y79gdJnasqCKVPyoS50t_SZCD3UxH9JhYigB_2emiw_3NmAIxLMFoirfQiJVkxyQDsjswl7-pMc8op_k3c8Q529BCM73oeZ_-vJinjyndsIaOwWnvW7TjRdfZwiqSvWgoiD3jMCONQcTAAUryQECvR1AhX2jEhfKSAMsHVklvm2fJ1hdYKeLP5-OSFZnpJpnW9zHoQ.p0lAhXdG4w0SkhBPrHVS-w',
    'kbn-version': '7.9.1',
    'origin': 'https://vpc-cosmos-logs-vtnxecylwjjggwhuqg66jqrw6y.us-east-1.es.amazonaws.com',
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