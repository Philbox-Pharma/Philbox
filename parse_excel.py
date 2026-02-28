import pandas as pd
import json

file_path = 'docs/qa_guides/Frontend_Bugs_and_Refactoring_Template(AutoRecovered).xlsx'

try:
    df = pd.read_excel(file_path, sheet_name='Frontend Bugs')

    # Clean up column names and NaN values
    df = df.fillna('')
    bugs_list = df.to_dict('records')

    with open('parsed_excel_bugs.json', 'w', encoding='utf-8') as f:
        json.dump(bugs_list, f, indent=2)

    print(f"Successfully parsed {len(bugs_list)} rows from Excel.")
except Exception as e:
    print(f"Error parsing Excel: {str(e)}")
