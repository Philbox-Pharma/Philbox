import pandas as pd
import json

excel_file = r"D:\1.STUDY\FYP\Main\Philbox\docs\qa_guides\Frontend_Bugs_and_Refactoring_Template(AutoRecovered).xlsx"
df = pd.read_excel(excel_file, sheet_name="Frontend Bugs")

# Filter for bugs not marked as 'Resolved' or 'done'
remaining = df[~df['Status'].str.lower().isin(['resolved', 'done'])]
bugs = remaining[['Bug ID', 'Page / Module', 'Description', 'Expected Behavior', 'Status']].to_dict(orient='records')

with open('remaining_bugs_utf8.json', 'w', encoding='utf-8') as f:
    json.dump(bugs, f, indent=2)
print("Saved to remaining_bugs_utf8.json")
