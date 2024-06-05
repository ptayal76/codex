#
# Copyright: ThoughtSpot Inc. 2023
#
# Collects the REST API usage Metric from Grafana->Prometheus
# Author: Raghuveer.Talekar@ThoughtSpot.com

import requests
import json
import csv
from datetime import datetime
from datetime import timedelta
from calendar import monthrange
import os.path

# Customise these values for automation. These can be taken as input args.
# start month to capture the metric. Inclusive. Format: '2020-01-01T00:00:00'
input_start_date = '2024-01-01T00:00:00'
# end month to capture the metric. Exclusive. Format: '2020-03-01T00:00:00'
input_end_date = '2024-05-01T00:00:00'
# output directory where collected metric file per year will be saved.
output_dir = os.path.expanduser('~') + '/api/'
# grafana login session cookie. Obtained from browser logged-in session to 'https://thoughtspot.grafana.net/'
# grafana_session=df7cfbea7d69a0b6ef3206d7e2513a09
grafana_session = 'grafana_session=c9f24f0db743780d2a945b61475fa583'
# grafana DS API query
url = "https://thoughtspot.grafana.net/api/ds/query"

# Metric data to be collected. DO NOT MODIFY UNLESS YOU KNOW WHAT YOU ARE DOING!
metric_keys = ('time', 'api', 'cluster', 'collection_level', 'error', 'method', 'org_id', 'rel_version', 'saas_env',
               'service_name', 'status', 'tenant_id', 'tenant_name', 'duration')


# This method processes list of metric frames into CSV rows
def process_api_metric_frames(api_metric_frames_list, csv_writer):
    for api_metric_frame in api_metric_frames_list:
        timestamp_index = 0
        duration_value_index = 1
        api_metric_sample = dict.fromkeys(metric_keys, '')

        # print(json.dumps(api_metric_frame['schema']['fields'], indent=4))
        for field_index, api_metric_frame_field in enumerate(api_metric_frame['schema']['fields']):
            if "Time" == api_metric_frame_field['name']:
                timestamp_index = field_index

            if "labels" in api_metric_frame_field:
                frame_label_value_map = api_metric_frame_field['labels']
                # print(json.dumps(frame_label_value_map, indent=4))

                if "api" in frame_label_value_map:
                    api_metric_sample['api'] = frame_label_value_map['api']
                if "cluster" in frame_label_value_map:
                    api_metric_sample['cluster'] = frame_label_value_map['cluster']
                if "collection_level" in frame_label_value_map:
                    api_metric_sample['collection_level'] = frame_label_value_map['collection_level']
                if "error" in frame_label_value_map:
                    api_metric_sample['error'] = frame_label_value_map['error']
                if "method" in frame_label_value_map:
                    api_metric_sample['method'] = frame_label_value_map['method']
                if "org_id" in frame_label_value_map:
                    api_metric_sample['org_id'] = frame_label_value_map['org_id']
                if "rel_version" in frame_label_value_map:
                    api_metric_sample['rel_version'] = frame_label_value_map['rel_version']
                if "saas_env" in frame_label_value_map:
                    api_metric_sample['saas_env'] = frame_label_value_map['saas_env']
                if "service_name" in frame_label_value_map:
                    api_metric_sample['service_name'] = frame_label_value_map['service_name']
                if "status_code" in frame_label_value_map:
                    api_metric_sample['status'] = frame_label_value_map['status_code']
                if "status" in frame_label_value_map:
                    api_metric_sample['status'] = frame_label_value_map['status']
                if "tenant_id" in frame_label_value_map:
                    api_metric_sample['tenant_id'] = frame_label_value_map['tenant_id']
                if "tenant_name" in frame_label_value_map:
                    api_metric_sample['tenant_name'] = frame_label_value_map['tenant_name']

        if timestamp_index == 1:
            duration_value_index = 0

        #print(json.dumps(api_metric_frame['data']['values'], indent=4))
        #print("timestamp_index", timestamp_index)
        if len(api_metric_frame['data']['values']) > 0:
            for item_index, timestamp_value in enumerate(api_metric_frame['data']['values'][timestamp_index]):
                api_metric_sample['time'] = datetime.utcfromtimestamp(timestamp_value / 1000.0)
                api_metric_sample['duration'] = api_metric_frame['data']['values'][duration_value_index][item_index]

        # print(api_metric_sample)
        csv_writer.writerow(api_metric_sample)


# This method collect the api metric usage data from start_time to end_time
def collect_api_metric_usage(csv_writer, start_time, end_time):
    print(f'Collecting API metric data FROM "{start_time}" TO "{end_time}"')

    payload = json.dumps({
        "queries": [
            {
                "refId": "prism-public-rest-api-v2-beta-query",
                "datasourceId": 4,
                "expr": "request_duration_seconds{saas_env=~\"prod|staging\", api=~\".*\", tenant_name=~\".*metadata.*\", quantile=\"0.95\"}",
                "interval": "3600",
                "maxDataPoints": 1000,
                "instant": False,
                "range": True,
                "format": "table"
            },
            {
                "refId": "tomcat-private-rest-api-v2-beta-query",
                "datasourceId": 4,
                "expr": "http_request_duration_us{saas_env=~\"prod|staging\", api=~\".*\", tenant_name=~\".*metadata.*\", quantile=\"0.95\"}",
                "interval": "3600",
                "maxDataPoints": 1000,
                "instant": False,
                "range": True,
                "format": "table"
            }
        ],
        "from": start_time,
        "to": end_time
    })
    headers = {
        'accept': 'application/json, text/plain, */*',
        'content-type': 'application/json',
        'Cookie': grafana_session
    }

    response = requests.request("POST", url, headers=headers, data=payload, allow_redirects=False)
    # print(response.text)

    # parse json file
    result = json.loads(response.text)
    # print(type(result))

    if "results" not in result:
        print(json.dumps(result, indent=4))
        exit(1)

    api_metric_frames_list = result['results']['prism-public-rest-api-v2-beta-query']['frames']
    process_api_metric_frames(api_metric_frames_list, csv_writer)
    # api_metric_frames_list_len = len(api_metric_frames_list)

    # api_metric_frames_list = result['results']['prism-public-rest-api-v2-ga-query']['frames']
    # process_api_metric_frames(api_metric_frames_list, csv_writer)

    api_metric_frames_list = result['results']['tomcat-private-rest-api-v2-beta-query']['frames']
    process_api_metric_frames(api_metric_frames_list, csv_writer)

    # api_metric_frames_list = result['results']['tomcat-private-rest-api-v2-ga-query']['frames']
    # process_api_metric_frames(api_metric_frames_list, csv_writer)

    # api_metric_frames_list = result['results']['tomcat-public-rest-api-v1-ga-query']['frames']
    # process_api_metric_frames(api_metric_frames_list, csv_writer)
    
    # api_metric_frames_list = result['results']['tomcat-private-rest-api-v1-ga-query']['frames']
    # process_api_metric_frames(api_metric_frames_list, csv_writer)


# This method generates the start and end timestamp for each month
# and invokes api usage metric collection per month
def start_rest_api_metric_collection():
    input_start_datetime = datetime.strptime(input_start_date, '%Y-%m-%dT%H:%M:%S')
    input_end_datetime = datetime.strptime(input_end_date, '%Y-%m-%dT%H:%M:%S')

    start_datetime = input_start_datetime
    end_datetime = start_datetime + timedelta(
        days=monthrange(start_datetime.year, start_datetime.month)[1]) - timedelta(milliseconds=1)
    while end_datetime <= input_end_datetime:
        start_time_str = start_datetime.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
        end_time_str = end_datetime.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
        output_file = f'{output_dir}/{start_datetime.year}_rest_api_metric.csv'

        file_exists = os.path.isfile(output_file)
        with open(output_file, mode='a') as csv_file:
            writer = csv.DictWriter(csv_file, fieldnames=metric_keys, delimiter=',', quotechar='"',
                                    quoting=csv.QUOTE_MINIMAL)
            if not file_exists:
                writer.writeheader()
            print(start_time_str, end_time_str)
            collect_api_metric_usage(writer, start_time_str, end_time_str)

        start_datetime = start_datetime + timedelta(days=monthrange(start_datetime.year, start_datetime.month)[1])
        end_datetime = start_datetime + timedelta(
            days=monthrange(start_datetime.year, start_datetime.month)[1]) - timedelta(milliseconds=1)


# Program execution entry point
if __name__ == '__main__':
    print(output_dir)
    start_rest_api_metric_collection()
