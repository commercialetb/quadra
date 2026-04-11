from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import pandas as pd


def norm(value: Any) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    if text.lower() == "nan":
        return ""
    return text


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare CRM Excel import for Supabase staging")
    parser.add_argument("xlsx", help="Path to source Excel file")
    parser.add_argument("--outdir", default="import_out", help="Output directory")
    args = parser.parse_args()

    xlsx_path = Path(args.xlsx)
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    companies = pd.read_excel(xlsx_path, sheet_name="Companies")
    contacts = pd.read_excel(xlsx_path, sheet_name="Contacts")

    companies = companies.rename(
        columns={
            "ID": "external_id",
            "Name": "name",
            "URL": "website",
            "Address": "address",
            "Tipologia": "source",
            "Settore": "industry",
            "Author": "raw_author",
        }
    )
    companies = companies[[c for c in ["external_id", "name", "website", "address", "source", "industry", "raw_author"] if c in companies.columns]]
    companies = companies.applymap(norm)
    companies = companies[companies["name"] != ""].drop_duplicates(subset=["name"])

    contacts = contacts.rename(
        columns={
            "ID": "external_id",
            "First Name": "first_name",
            "Last Name": "last_name",
            "Title": "role",
            "Email": "email",
            "Phone": "phone",
            "Mobile Phone": "mobile_phone",
            "Company": "company_name",
            "Status": "status",
            "Author": "raw_author",
        }
    )
    contacts = contacts[[c for c in ["external_id", "first_name", "last_name", "role", "email", "phone", "mobile_phone", "company_name", "status", "raw_author"] if c in contacts.columns]]
    contacts = contacts.applymap(norm)
    contacts = contacts[(contacts["first_name"] != "") | (contacts["last_name"] != "")]

    companies.to_csv(outdir / "companies_clean.csv", index=False)
    contacts.to_csv(outdir / "contacts_clean.csv", index=False)

    unmatched = sorted({name for name in contacts["company_name"].unique() if name and name not in set(companies["name"].unique())})
    report = {
        "companies": len(companies),
        "contacts": len(contacts),
        "unmatched_company_names": unmatched,
    }
    (outdir / "import_report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
