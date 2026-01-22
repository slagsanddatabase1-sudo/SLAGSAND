import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Container, Button, Alert, Card } from 'react-bootstrap';

const TestConnection = () => {
    const [status, setStatus] = useState('Idle');
    const [log, setLog] = useState([]);

    const addLog = (msg) => setLog(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const runTest = async () => {
        setStatus('Testing...');
        setLog([]);
        addLog('Starting Test...');

        try {
            // 1. Check Env
            const url = import.meta.env.VITE_SUPABASE_URL;
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
            addLog(`Env URL found: ${!!url}`);
            addLog(`Env Key found: ${!!key}`);

            if (!url || !key) {
                throw new Error('Missing Supabase Environment Variables');
            }

            // 2. Test Connection / Auth
            addLog('Checking Auth Session...');
            const { data: { session } } = await supabase.auth.getSession();
            addLog(`Session: ${session ? 'Authenticated' : 'Anonymous'}`);

            // 3. Test Insert (Inquiries)
            addLog('Testing Insert into "inquiries"...');
            const { data: insertData, error: insertError } = await supabase.from('inquiries').insert([{
                type: 'test_connection',
                name: 'Test Agent',
                contact: '0000000000',
                email: 'test@agent.com',
                details: { message: 'Connection Test' },
                status: 'new'
            }]).select();

            if (insertError) {
                addLog(`❌ Insert Failed: ${insertError.message}`);
                console.error(insertError);
                throw insertError;
            } else {
                addLog('✅ Insert Success!');
                addLog(`Inserted ID: ${insertData?.[0]?.id}`);
            }

            // 4. Test Backend
            addLog('Testing Backend Connection (/api)...');
            const backendRes = await fetch('/api');
            if (backendRes.ok) {
                const text = await backendRes.text();
                addLog(`✅ Backend Reachable: ${text}`);
            } else {
                addLog(`❌ Backend Error: ${backendRes.status}`);
            }

            setStatus('Success');
        } catch (error) {
            setStatus('Error');
            addLog(`❌ ERROR: ${error.message || JSON.stringify(error)}`);
        }
    };

    return (
        <Container className="py-5">
            <Card className="p-4 shadow">
                <h3>Supabase Connection Test</h3>
                <div className="mb-3">
                    <Button onClick={runTest} disabled={status === 'Testing...'}>
                        {status === 'Testing...' ? 'Running...' : 'Run Diagnostics'}
                    </Button>
                </div>

                {status === 'Success' && <Alert variant="success">Test Passed!</Alert>}
                {status === 'Error' && <Alert variant="danger">Test Failed!</Alert>}

                <div className="bg-light p-3 rounded" style={{ fontFamily: 'monospace', minHeight: '200px' }}>
                    {log.map((line, i) => <div key={i}>{line}</div>)}
                    {log.length === 0 && <span className="text-muted">Click "Run Diagnostics" to start...</span>}
                </div>
            </Card>
        </Container>
    );
};

export default TestConnection;
