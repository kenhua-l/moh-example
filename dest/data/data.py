import csv, json
import random
cluster = ['Loc A', 'Loc B', 'Loc C']

def csv_to_json(input):
    data = {}
    with open(input, 'r') as file:
        csv_f = csv.DictReader(file)
        fieldnames = csv_f.fieldnames
        id = 1
        for row in csv_f:
            data[id] = row
            id = id + 1

    return data

def process_data(rough, clean):
    clean_output = ['Case_ID', 'Imported_o', 'Place', 'Age', 'Gender', 'Nationality', 'Status', 'Date_of_Co', 'Date_of_Di', 'Prs_rl_URL', 'Prs_rl_URL2']
    data = []
    # expose only data which are publicly available
    for key, val in rough.items():
        case_detail = {}
        for output in clean_output:
            case_detail[output] = val[output]
        # add a fake cluster
        if case_detail['Imported_o'] == 'Local':
            case_detail['Loc_Cluster'] = random.choice(cluster)
        else:
            case_detail['Loc_Cluster'] = 'None'
        data.append(case_detail)

    with open(clean, 'w') as w:
        w.write(json.dumps(data, indent=4))


def main():
    input = 'covid.csv'
    rough_json = csv_to_json(input)
    output_clean = 'dest/data/covid-clean.json'
    process_data(rough_json, output_clean)

main()
