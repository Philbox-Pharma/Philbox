import pandas as pd
import json

# Read the Excel file
excel_file = r"D:\1.STUDY\FYP\Main\Philbox\docs\qa_guides\Frontend_Bugs_and_Refactoring_Template(AutoRecovered).xlsx"

try:
    # Read all sheets
    xls = pd.ExcelFile(excel_file)

    print("=" * 80)
    print("SHEETS FOUND IN EXCEL FILE:")
    print("=" * 80)
    for sheet_name in xls.sheet_names:
        print(f"- {sheet_name}")
    print("\n")

    # Read each sheet and display
    for sheet_name in xls.sheet_names:
        print("=" * 80)
        print(f"SHEET: {sheet_name}")
        print("=" * 80)

        df = pd.read_excel(excel_file, sheet_name=sheet_name)

        # Display the dataframe
        print(f"\nColumns: {list(df.columns)}\n")
        print(f"Total rows: {len(df)}\n")

        # Display all rows
        pd.set_option('display.max_columns', None)
        pd.set_option('display.max_rows', None)
        pd.set_option('display.width', None)
        pd.set_option('display.max_colwidth', None)

        print(df.to_string())
        print("\n\n")

except Exception as e:
    print(f"Error reading Excel file: {e}")
    import traceback
    traceback.print_exc()
