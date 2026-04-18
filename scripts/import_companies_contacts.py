from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd


def clean_value(value):
    if pd.isna(value):
        return None
    if isinstance(value, str):
        value = value.strip()
        return value or None
    return value


def sheet_to_records(path: Path, sheet_name: str):
    df = pd.read_excel(path, sheet_name=sheet_name)
    df = df.dropna(how='all')
    df.columns = [str(c).strip() for c in df.columns]
    return [{k: clean_value(v) for k, v in row.items()} for row in df.to_dict(orient='records')]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('input_file')
    parser.add_argument('--companies-sheet', default='Companies')
    parser.add_argument('--contacts-sheet', default='Contacts')
    parser.add_argument('--out-dir', default='import_out')
    args = parser.parse_args()

    input_path = Path(args.input_file)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    companies = sheet_to_records(input_path, args.companies_sheet)
    contacts = sheet_to_records(input_path, args.contacts_sheet)

    (out_dir / 'companies.cleaned.json').write_text(json.dumps(companies, ensure_ascii=False, indent=2), encoding='utf-8')
    (out_dir / 'contacts.cleaned.json').write_text(json.dumps(contacts, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f'Companies: {len(companies)}')
    print(f'Contacts: {len(contacts)}')
    print(f'Output directory: {out_dir}')


if __name__ == '__main__':
    main()
