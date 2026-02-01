import json
import csv
import os
import glob
from urllib.parse import urlparse

# Cấu hình đường dẫn
INPUT_DIR = '.'
OUTPUT_DIR = 'processed_data'
OUTPUT_JSON = os.path.join(OUTPUT_DIR, 'aggregated_report.json')
OUTPUT_CSV = os.path.join(OUTPUT_DIR, 'all_resources.csv')

def get_domain(url):
    try:
        parsed = urlparse(url)
        return parsed.netloc
    except:
        return 'unknown'

def classify_platform(domain):
    domain = domain.lower()
    if 'facebook' in domain:
        return 'Facebook'
    if 'tiktok' in domain:
        return 'TikTok'
    if 'kwai' in domain or 'yximgs' in domain or 'ap4r' in domain: # ap4r is often associated with Kwai/Kuaishou cdns
        return 'Kwai/Kuaishou'
    if 'pg88' in domain:
        return 'PG88'
    if 'cloudflare' in domain:
        return 'Cloudflare'
    if 'qiliangjia' in domain:
        return 'Qiliangjia'
    return 'Other'

def process_files():
    aggregated_data = []
    
    # 1. Xử lý các file JSON
    json_files = glob.glob(os.path.join(INPUT_DIR, '*.json'))
    for file_path in json_files:
        filename = os.path.basename(file_path)
        if filename == 'package.json' or filename == 'tsconfig.json': # Skip config files if any
            continue
            
        print(f"Processing JSON file: {filename}")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Cấu trúc JSON hiện tại là Key (URL) -> Value (Dict details)
            for url, details in data.items():
                domain = get_domain(url)
                platform = classify_platform(domain)
                
                entry = {
                    'source_file': filename,
                    'url': url,
                    'domain': domain,
                    'platform': platform,
                    'content_type': details.get('content type', ''),
                    'size': details.get('size', 0),
                    'status': details.get('status', ''),
                    'title': details.get('title', '')
                }
                aggregated_data.append(entry)
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    # 2. Xử lý các file CSV
    csv_files = glob.glob(os.path.join(INPUT_DIR, '*.csv'))
    for file_path in csv_files:
        filename = os.path.basename(file_path)
        print(f"Processing CSV file: {filename}")
        try:
            # Try different encodings
            content = None
            for encoding in ['utf-8', 'utf-8-sig', 'latin1', 'cp1252']:
                try:
                    with open(file_path, 'r', encoding=encoding) as f:
                        content = f.read()
                    break
                except UnicodeDecodeError:
                    continue
            
            if content is None:
                print(f"Failed to read {filename} with standard encodings.")
                continue

            # Parse CSV from content string
            from io import StringIO
            f_io = StringIO(content)
            reader = csv.reader(f_io)
            for row in reader:
                if not row: continue
                if len(row) >= 5:
                    url = row[0].strip()
                    status = row[1].strip()
                    try:
                        size = int(row[2].strip())
                    except:
                        size = 0
                    title = row[3].strip()
                    content_type = row[4].strip()
                    
                    domain = get_domain(url)
                    platform = classify_platform(domain)

                    entry = {
                        'source_file': filename,
                        'url': url,
                        'domain': domain,
                        'platform': platform,
                        'content_type': content_type,
                        'size': size,
                        'status': status,
                        'title': title
                    }
                    
                    # Tránh duplicate nếu cùng URL đã có từ file JSON (ví dụ pg88.csv và 1.json trùng nhau)
                    # Tuy nhiên user yêu cầu tổng hợp, ta cứ giữ lại và đánh dấu source
                    aggregated_data.append(entry)
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    # 3. Tổng hợp và Thống kê
    summary = {
        'total_records': len(aggregated_data),
        'platforms': {},
        'details': aggregated_data
    }

    for item in aggregated_data:
        plat = item['platform']
        if plat not in summary['platforms']:
            summary['platforms'][plat] = {
                'count': 0,
                'total_size': 0,
                'files': []
            }
        summary['platforms'][plat]['count'] += 1
        summary['platforms'][plat]['total_size'] += item['size']
        summary['platforms'][plat]['files'].append(item['url'])

    # 4. Ghi ra file JSON
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=4, ensure_ascii=False)
    
    print(f"Exported JSON report to {OUTPUT_JSON}")

    # 5. Ghi ra file CSV
    if aggregated_data:
        keys = aggregated_data[0].keys()
        with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(aggregated_data)
        print(f"Exported CSV report to {OUTPUT_CSV}")

if __name__ == "__main__":
    process_files()
