import os
import json
import csv
import glob
from urllib.parse import urlparse
from collections import defaultdict, Counter
import datetime

# Configuration
DATA_DIR = r"d:\Tool\WEB\LOVABLE\Y1\Y3"
OUTPUT_DIR = os.path.join(DATA_DIR, "processed_data")
REPORT_FILE = os.path.join(OUTPUT_DIR, "comprehensive_data_insight.md")
JSON_SUMMARY_FILE = os.path.join(OUTPUT_DIR, "comprehensive_data_summary.json")

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Data Structures
all_resources = []
domain_stats = Counter()
content_type_stats = Counter()
status_stats = Counter()
file_size_stats = []
titles_found = set()

def normalize_content_type(ct):
    if not ct:
        return "unknown"
    return ct.split(';')[0].strip().lower()

def get_domain(url):
    try:
        return urlparse(url).netloc
    except:
        return "invalid-url"

def process_json_file(filepath):
    print(f"Processing JSON: {filepath}")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        for url, info in data.items():
            resource = {
                "source_file": os.path.basename(filepath),
                "url": url,
                "content_type": info.get("content type", ""),
                "size": info.get("size", 0),
                "status": info.get("status", "Unknown"),
                "title": info.get("title", "")
            }
            all_resources.append(resource)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

def process_csv_file(filepath):
    print(f"Processing CSV: {filepath}")
    # Try different encodings
    encodings = ['utf-8', 'utf-8-sig', 'latin1', 'cp1252']
    content = None
    
    for enc in encodings:
        try:
            with open(filepath, 'r', encoding=enc) as f:
                content = f.read()
            break
        except UnicodeDecodeError:
            continue
            
    if content:
        reader = csv.reader(content.splitlines())
        for row in reader:
            if not row or len(row) < 3: continue
            
            # CSV format based on observation: URL, Status, Size, Title, Content-Type
            # But headerless, so we infer
            url = row[0].strip()
            status = row[1].strip() if len(row) > 1 else ""
            size_str = row[2].strip() if len(row) > 2 else "0"
            title = row[3].strip() if len(row) > 3 else ""
            content_type = row[4].strip() if len(row) > 4 else ""
            
            try:
                size = int(size_str)
            except:
                size = 0
                
            resource = {
                "source_file": os.path.basename(filepath),
                "url": url,
                "content_type": content_type,
                "size": size,
                "status": status,
                "title": title
            }
            all_resources.append(resource)

def analyze_data():
    global all_resources
    
    for res in all_resources:
        domain = get_domain(res['url'])
        domain_stats[domain] += 1
        
        ct = normalize_content_type(res['content_type'])
        content_type_stats[ct] += 1
        
        status_stats[res['status']] += 1
        
        if res['size'] > 0:
            file_size_stats.append((res['url'], res['size']))
            
        if res['title']:
            titles_found.add(res['title'])

def generate_report():
    total_files = len(all_resources)
    total_size_bytes = sum(r['size'] for r in all_resources)
    total_size_mb = total_size_bytes / (1024 * 1024)
    
    top_domains = domain_stats.most_common(10)
    top_content_types = content_type_stats.most_common(10)
    
    # Sort files by size descending
    top_large_files = sorted(file_size_stats, key=lambda x: x[1], reverse=True)[:10]
    
    md_content = f"""# Báo Cáo Phân Tích Dữ Liệu Chi Tiết

**Ngày tạo:** {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
**Tổng số tài nguyên:** {total_files}
**Tổng dung lượng:** {total_size_mb:.2f} MB

## 1. Phân Tích Tên Miền (Domains)
Các tên miền chính được hệ thống truy cập:

| Domain | Số lượng Request | Tỷ lệ |
|--------|------------------|-------|
"""
    for domain, count in top_domains:
        percent = (count / total_files) * 100
        md_content += f"| `{domain}` | {count} | {percent:.1f}% |\n"
        
    md_content += """
## 2. Phân Loại Tài Nguyên (Content Types)
Phân bố các loại tệp tin trong hệ thống:

| Loại tệp (MIME) | Số lượng |
|-----------------|----------|
"""
    for ct, count in top_content_types:
        md_content += f"| `{ct}` | {count} |\n"

    md_content += """
## 3. Top 10 File Nặng Nhất
Những file chiếm dung lượng lớn nhất (cần chú ý tối ưu):

| URL | Dung lượng (KB) |
|-----|-----------------|
"""
    for url, size in top_large_files:
        md_content += f"| `{url}` | {size/1024:.1f} KB |\n"

    md_content += """
## 4. Thông Tin Tiêu Đề Trang (Page Titles)
Các tiêu đề trang web tìm thấy trong dữ liệu (giúp nhận diện nội dung):

"""
    for title in titles_found:
        if title.strip():
            md_content += f"- {title}\n"
            
    md_content += """
## 5. Danh Sách File Nguồn Dữ Liệu
Các file JSON/CSV đã được quét để tạo báo cáo này:
"""
    source_files = set(r['source_file'] for r in all_resources)
    for f in source_files:
        md_content += f"- `{f}`\n"

    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    print(f"Markdown report generated: {REPORT_FILE}")
    
    # Generate JSON Summary
    summary = {
        "timestamp": datetime.datetime.now().isoformat(),
        "total_resources": total_files,
        "total_size_bytes": total_size_bytes,
        "domains": dict(domain_stats),
        "content_types": dict(content_type_stats),
        "titles": list(titles_found)
    }
    
    with open(JSON_SUMMARY_FILE, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print(f"JSON summary generated: {JSON_SUMMARY_FILE}")

def main():
    # Find all JSON and CSV files
    json_files = glob.glob(os.path.join(DATA_DIR, "*.json"))
    csv_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
    
    # Exclude processed files to avoid duplication if re-running
    json_files = [f for f in json_files if "processed_data" not in f]
    csv_files = [f for f in csv_files if "processed_data" not in f]
    
    for f in json_files:
        process_json_file(f)
        
    for f in csv_files:
        process_csv_file(f)
        
    analyze_data()
    generate_report()

if __name__ == "__main__":
    main()
