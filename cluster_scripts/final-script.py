import argparse
import http.client
import json
import os

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
                                    "gte": "2024-06-05T04:39:21.113Z",
                                    "lte": "2024-06-07T04:48:09.592Z",
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
    'cookie': 'STATE-TOKEN=8c591f7d-4b7d-417a-845b-419c7214b2af; REFRESH-TOKEN=eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.QEAPM7OSq1Fv3sZpGRvHXHmjlYINUm9SNHr_nn8AE7Ox8HhKUOJczczz50zfI5lfQTOJpU9dHTzXO1eyXoLpiy8DvyO5JJr9VTN_7vlevhSb_ktHQt3a9RWqUTBr6-SauZ4VpQdF1Pudb9ST6M8hce7UNiViswQbZf6lxxvLhKDnQihwRQL5ycZe12CbrrAIVI_NeP1J-7VidVtoB8a8bI9JmNTzmgdaKFJBEEBSjHSjg4SrM3o9bTtbGjBWNAztULuRo2vzgQWtm9jjMNi_WMJwZx13YahaMpb66Dt3qJ2e4waFuepGfVcPqjzGrFXqzvLVCEkQr1ROvWT4xcHg6w.sto5QpQLvUz5VNsn.abYOJ2QhobfEz2y_kxuMJjiQ_dxJlmndnXQiNC51Pj4rIlWDp8E-HGhYYFLMM1Yo-HTzXjfERU00xYkBMkvmerAs5o2x_jM9t0kkx1dxF30SBUar-caqIKVgaaOLay9uA9JQk2zX-2t-ErflKHYlKYqC3OqtGv2gFV_HWVuuwVjSRBxlIILVreGUjIE2HD9QN3BF_Mrsdp2LgPmdbMfgCiyVARg1tYzu8Wswkkgp41GX0B0iaYGREPQdpi5jGHFbACZKefTBId88eZHmnD_p9QObmzTycfGsAUcqbhmWfHhiy1Jopw30Ko3DFtUuXDpwXYtm6GCG3V6qMLMbvNK0pEw2Go1gCbLnZtH0KFn1HEUs5wcMO3wHLt0HD3zirms1tnh8oORGyYHjfKT-PGPZjkvgWiUFQyWdyamunLLblsFAOT73Mfy42RFRHR0CM2DiRkQ56-wzT2Z0IVuSoZgRjAQqBCJhCRdbB7-yBq5Vi5IYKCsTz_J9CfE5lzlq0o-tIaiYWqqshqx2H5lrfvdBomQM3mLHqru34BhTgENqE4DIX24_2U4GYFOJpD5gV1H_q2w6UVKgGr3VKFkb_3zCK-amUh-0dHpDlG-mZged-Na_N6HVM6PHuLjZ4CRHD_fWDLCQNaL5ZMJOJjLzIGtZTVwwK-Yo_2v0RFzt-pxfsqMnWJHn0Ky6atqT5e1t06AeO1S6YzyIYTTCp6wzp0rkwTali-Xob3FasEJ-JAEIm8O0INWVhBbZUONYZMAzybOhm9XogQ_NXKYFPP7Wl0Uxg4yGLHZywg4l5krcpzOC2UGD1ykprFfZbk6Lg1uP2cI1OV-XGfHqHmVI7YzB5iWndAyKDDiVw9lLimY_jO6mkHhk1Vvevd8pMo6N8apEYAXusAp1P0FIh7YIucINmRZCmn_qIrUhSfSLayvefdMMHVsSivkYJL-fk-CigA155eGbw73uOBnjeF1iPqe927H1XgZC_PtcK9k8JHR6_zdqCm0Sbde-ydEy8DzGq6ZicrmJxCi2sZkJXxVgE7j8lr7ss8LaIKG_uDmhOXisCCVt3PuSpeOMAJRQbylgKuMSXsBpUePxJP4Fs-H5dk4mJDiuhEuZVMYVFmOySiftR57ZQDLQIn2AtB7jZp4b3j1mD5I68sGLkhcDMa9Y8_yEaE1Hp1NFspPcF01j3muKj0Lsp40V2KTNH7p_hmCdixH1oxrQ9mpsjooRD95BSfpfvK5JW4wZskVORrF4zs0saZw.agLdjZLcFb898QkNLxRChg; COGNITO-ENABLED=True; ID-TOKEN=eyJraWQiOiJnSm1GaXlrYkxTSVlvaThaaWVTY0lQOUpOUFlBVE44em43SjNsMUhBMm9ZPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiQjNrR0lzeUFRVEFZSlVvdU1SSF9TZyIsInN1YiI6ImRlN2IzMDJiLWQ4MTEtNGExMi05ODJkLWE5OTlmOWZkZjhjMiIsImNvZ25pdG86Z3JvdXBzIjpbInVzLXdlc3QtMl91QWxTTmxyTjlfT2t0YS1PSURDIl0sImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfdUFsU05sck45IiwiY29nbml0bzp1c2VybmFtZSI6Ik9rdGEtT0lEQ18wMHVxb3kyNmdyWlhDdHh0NzB4NyIsImF1ZCI6IjdyMmJiNzVkOW1jNGo3OWJ1aGNoMm9pZDZoIiwiaWRlbnRpdGllcyI6W3sidXNlcklkIjoiMDB1cW95MjZnclpYQ3R4dDcweDciLCJwcm92aWRlck5hbWUiOiJPa3RhLU9JREMiLCJwcm92aWRlclR5cGUiOiJPSURDIiwiaXNzdWVyIjpudWxsLCJwcmltYXJ5IjoidHJ1ZSIsImRhdGVDcmVhdGVkIjoiMTY5Mjg4NDQ0MzM2NiJ9XSwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MTc0OTU5NjcsImV4cCI6MTcxNzczOTMwMCwiaWF0IjoxNzE3NzM1NzAwLCJlbWFpbCI6InNhbmRlZXAueWFkYXZAdGhvdWdodHNwb3QuY29tIn0.fh15WjwfjTpMG4t4xKL1V0AV-dlSXVGgSrbz7GBH7YgoCprHIJ93bEX9XblgfwuFxp2jZmSDcOj85PM8Gwqs1MzSMNeyjENlHPyZJ0NtjcwwuAk7x4vvY_dMM_DfdLK6ENYAduNeV_xGODpi9RnBETFoQ8nQq_FaG-v9jN2aRcstyjDFJ_jmLAMhQqKGGLXV0JwrQuPRgjtRI8BbouwAEmwB08STzJiovX4SCfQJv5IPNICf2m1r-VcTyTpIeVkppRZHZsOKf6X1b_y3QI8sATKvTziiYGW2ydzPZQAHZwq-_ETtK3AVIkhM5LksbTI5GHrxSxiGhIqycXoeMTjDGQ; ACCESS-TOKEN=eyJraWQiOiI2WGJMRis0dnJaaDlrSHlNQjRldmxCdGN0S2NNNjZqamJwNFlDQUE4a21RPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJkZTdiMzAyYi1kODExLTRhMTItOTgyZC1hOTk5ZjlmZGY4YzIiLCJjb2duaXRvOmdyb3VwcyI6WyJ1cy13ZXN0LTJfdUFsU05sck45X09rdGEtT0lEQyJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMl91QWxTTmxyTjkiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI3cjJiYjc1ZDltYzRqNzlidWhjaDJvaWQ2aCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoicGhvbmUgb3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE3MTc0OTU5NjcsImV4cCI6MTcxNzczOTMwMCwiaWF0IjoxNzE3NzM1NzAwLCJqdGkiOiIxZTI2MTBhYi04MDA2LTQwYTEtYTQ4OC05N2RmZDY1OTk2MWIiLCJ1c2VybmFtZSI6Ik9rdGEtT0lEQ18wMHVxb3kyNmdyWlhDdHh0NzB4NyJ9.detMz6nYGs2uv_3uzMjmhcA4IL4nUEJMF36Odye8SugeB8BjaLpjCZ_Y3wtrkMpscy_r9p7vqeiiVyybRcaYLMkBRIBgQKVbKovzkS2C-TM_gd7X8yYShScg1aCCXR_03m6nBCKe2lDbtvRvJEoGQOcynzrU0PPGzjGgQHJ2OCekfTC9NVScxtSZklHB5MhxKKUk1IPJLivGb9r8o8kr-IESyTFXfjcaNQsxeXKb8jnzVzhiJYmlcRU67YGSFPqzOY2tLKRduNfB4UqHOq9xJMsJYuV2rcCH8Ex58XjgbJfgDgx1weLhnozQ3T0L_nZksgUbnCMG7xut8IkQyg1WXg; ACCESS-TOKEN=eyJraWQiOiI2WGJMRis0dnJaaDlrSHlNQjRldmxCdGN0S2NNNjZqamJwNFlDQUE4a21RPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJkZTdiMzAyYi1kODExLTRhMTItOTgyZC1hOTk5ZjlmZGY4YzIiLCJjb2duaXRvOmdyb3VwcyI6WyJ1cy13ZXN0LTJfdUFsU05sck45X09rdGEtT0lEQyJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMl91QWxTTmxyTjkiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI3cjJiYjc1ZDltYzRqNzlidWhjaDJvaWQ2aCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoicGhvbmUgb3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE3MTc0OTU5NjcsImV4cCI6MTcxNzczOTMwMCwiaWF0IjoxNzE3NzM1NzAwLCJqdGkiOiIxZTI2MTBhYi04MDA2LTQwYTEtYTQ4OC05N2RmZDY1OTk2MWIiLCJ1c2VybmFtZSI6Ik9rdGEtT0lEQ18wMHVxb3kyNmdyWlhDdHh0NzB4NyJ9.detMz6nYGs2uv_3uzMjmhcA4IL4nUEJMF36Odye8SugeB8BjaLpjCZ_Y3wtrkMpscy_r9p7vqeiiVyybRcaYLMkBRIBgQKVbKovzkS2C-TM_gd7X8yYShScg1aCCXR_03m6nBCKe2lDbtvRvJEoGQOcynzrU0PPGzjGgQHJ2OCekfTC9NVScxtSZklHB5MhxKKUk1IPJLivGb9r8o8kr-IESyTFXfjcaNQsxeXKb8jnzVzhiJYmlcRU67YGSFPqzOY2tLKRduNfB4UqHOq9xJMsJYuV2rcCH8Ex58XjgbJfgDgx1weLhnozQ3T0L_nZksgUbnCMG7xut8IkQyg1WXg; COGNITO-ENABLED=True; ID-TOKEN=eyJraWQiOiJnSm1GaXlrYkxTSVlvaThaaWVTY0lQOUpOUFlBVE44em43SjNsMUhBMm9ZPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiQjNrR0lzeUFRVEFZSlVvdU1SSF9TZyIsInN1YiI6ImRlN2IzMDJiLWQ4MTEtNGExMi05ODJkLWE5OTlmOWZkZjhjMiIsImNvZ25pdG86Z3JvdXBzIjpbInVzLXdlc3QtMl91QWxTTmxyTjlfT2t0YS1PSURDIl0sImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfdUFsU05sck45IiwiY29nbml0bzp1c2VybmFtZSI6Ik9rdGEtT0lEQ18wMHVxb3kyNmdyWlhDdHh0NzB4NyIsImF1ZCI6IjdyMmJiNzVkOW1jNGo3OWJ1aGNoMm9pZDZoIiwiaWRlbnRpdGllcyI6W3sidXNlcklkIjoiMDB1cW95MjZnclpYQ3R4dDcweDciLCJwcm92aWRlck5hbWUiOiJPa3RhLU9JREMiLCJwcm92aWRlclR5cGUiOiJPSURDIiwiaXNzdWVyIjpudWxsLCJwcmltYXJ5IjoidHJ1ZSIsImRhdGVDcmVhdGVkIjoiMTY5Mjg4NDQ0MzM2NiJ9XSwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MTc0OTU5NjcsImV4cCI6MTcxNzczOTMwMCwiaWF0IjoxNzE3NzM1NzAwLCJlbWFpbCI6InNhbmRlZXAueWFkYXZAdGhvdWdodHNwb3QuY29tIn0.fh15WjwfjTpMG4t4xKL1V0AV-dlSXVGgSrbz7GBH7YgoCprHIJ93bEX9XblgfwuFxp2jZmSDcOj85PM8Gwqs1MzSMNeyjENlHPyZJ0NtjcwwuAk7x4vvY_dMM_DfdLK6ENYAduNeV_xGODpi9RnBETFoQ8nQq_FaG-v9jN2aRcstyjDFJ_jmLAMhQqKGGLXV0JwrQuPRgjtRI8BbouwAEmwB08STzJiovX4SCfQJv5IPNICf2m1r-VcTyTpIeVkppRZHZsOKf6X1b_y3QI8sATKvTziiYGW2ydzPZQAHZwq-_ETtK3AVIkhM5LksbTI5GHrxSxiGhIqycXoeMTjDGQ; REFRESH-TOKEN=eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.QEAPM7OSq1Fv3sZpGRvHXHmjlYINUm9SNHr_nn8AE7Ox8HhKUOJczczz50zfI5lfQTOJpU9dHTzXO1eyXoLpiy8DvyO5JJr9VTN_7vlevhSb_ktHQt3a9RWqUTBr6-SauZ4VpQdF1Pudb9ST6M8hce7UNiViswQbZf6lxxvLhKDnQihwRQL5ycZe12CbrrAIVI_NeP1J-7VidVtoB8a8bI9JmNTzmgdaKFJBEEBSjHSjg4SrM3o9bTtbGjBWNAztULuRo2vzgQWtm9jjMNi_WMJwZx13YahaMpb66Dt3qJ2e4waFuepGfVcPqjzGrFXqzvLVCEkQr1ROvWT4xcHg6w.sto5QpQLvUz5VNsn.abYOJ2QhobfEz2y_kxuMJjiQ_dxJlmndnXQiNC51Pj4rIlWDp8E-HGhYYFLMM1Yo-HTzXjfERU00xYkBMkvmerAs5o2x_jM9t0kkx1dxF30SBUar-caqIKVgaaOLay9uA9JQk2zX-2t-ErflKHYlKYqC3OqtGv2gFV_HWVuuwVjSRBxlIILVreGUjIE2HD9QN3BF_Mrsdp2LgPmdbMfgCiyVARg1tYzu8Wswkkgp41GX0B0iaYGREPQdpi5jGHFbACZKefTBId88eZHmnD_p9QObmzTycfGsAUcqbhmWfHhiy1Jopw30Ko3DFtUuXDpwXYtm6GCG3V6qMLMbvNK0pEw2Go1gCbLnZtH0KFn1HEUs5wcMO3wHLt0HD3zirms1tnh8oORGyYHjfKT-PGPZjkvgWiUFQyWdyamunLLblsFAOT73Mfy42RFRHR0CM2DiRkQ56-wzT2Z0IVuSoZgRjAQqBCJhCRdbB7-yBq5Vi5IYKCsTz_J9CfE5lzlq0o-tIaiYWqqshqx2H5lrfvdBomQM3mLHqru34BhTgENqE4DIX24_2U4GYFOJpD5gV1H_q2w6UVKgGr3VKFkb_3zCK-amUh-0dHpDlG-mZged-Na_N6HVM6PHuLjZ4CRHD_fWDLCQNaL5ZMJOJjLzIGtZTVwwK-Yo_2v0RFzt-pxfsqMnWJHn0Ky6atqT5e1t06AeO1S6YzyIYTTCp6wzp0rkwTali-Xob3FasEJ-JAEIm8O0INWVhBbZUONYZMAzybOhm9XogQ_NXKYFPP7Wl0Uxg4yGLHZywg4l5krcpzOC2UGD1ykprFfZbk6Lg1uP2cI1OV-XGfHqHmVI7YzB5iWndAyKDDiVw9lLimY_jO6mkHhk1Vvevd8pMo6N8apEYAXusAp1P0FIh7YIucINmRZCmn_qIrUhSfSLayvefdMMHVsSivkYJL-fk-CigA155eGbw73uOBnjeF1iPqe927H1XgZC_PtcK9k8JHR6_zdqCm0Sbde-ydEy8DzGq6ZicrmJxCi2sZkJXxVgE7j8lr7ss8LaIKG_uDmhOXisCCVt3PuSpeOMAJRQbylgKuMSXsBpUePxJP4Fs-H5dk4mJDiuhEuZVMYVFmOySiftR57ZQDLQIn2AtB7jZp4b3j1mD5I68sGLkhcDMa9Y8_yEaE1Hp1NFspPcF01j3muKj0Lsp40V2KTNH7p_hmCdixH1oxrQ9mpsjooRD95BSfpfvK5JW4wZskVORrF4zs0saZw.agLdjZLcFb898QkNLxRChg',
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