import requests

url = 'https://byrqofzzjvjthggoieey.supabase.co'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5cnFvZnp6anZqdGhnZ29pZWV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA0MTg3NSwiZXhwIjoyMDg0NjE3ODc1fQ.cF-VOjFtgFaQOOGVeS0ftVswgu1C439tSwupoV10uis'

sql = "ALTER TABLE public.pincodes ADD COLUMN IF NOT EXISTS twenty_ton_hydraulic text DEFAULT '0';"

resp = requests.post(
    f'{url}/rest/v1/rpc/exec_sql',
    headers={
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json'
    },
    json={'query': sql}
)
print(f'RPC Status: {resp.status_code}')
print(f'RPC Response: {resp.text[:300]}')

if resp.status_code != 200:
    print('\nRPC not available. Checking if column already exists...')
    check = requests.get(
        f'{url}/rest/v1/pincodes?select=twenty_ton_hydraulic&limit=1',
        headers={
            'apikey': key,
            'Authorization': f'Bearer {key}',
        }
    )
    print(f'Column check status: {check.status_code}')
    if check.status_code == 200:
        print('Column already exists!')
    else:
        print(f'Column missing: {check.text[:200]}')
        print('\nPlease add the column manually in Supabase SQL Editor:')
        print(sql)
