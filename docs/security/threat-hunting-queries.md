# Threat Hunting Queries for Beuni Corporate Gifting Platform

## Authentication & Access Queries

### 1. Multiple Failed Login Attempts
```sql
SELECT 
    username, 
    COUNT(*) as failed_attempts, 
    MAX(timestamp) as last_attempt
FROM login_attempts
WHERE status = 'FAILED'
GROUP BY username
HAVING COUNT(*) > 5
ORDER BY failed_attempts DESC
```

### 2. Suspicious IP Access Patterns
```sql
SELECT 
    ip_address, 
    COUNT(DISTINCT username) as unique_users,
    COUNT(*) as total_access_attempts
FROM access_logs
WHERE timestamp > NOW() - INTERVAL 24 HOURS
GROUP BY ip_address
HAVING 
    total_access_attempts > 50 OR 
    unique_users > 3
ORDER BY total_access_attempts DESC
```

## Data Export Monitoring

### 3. Mass Data Export Detection
```sql
SELECT 
    user_id,
    COUNT(*) as export_count,
    SUM(exported_records) as total_records,
    MAX(timestamp) as last_export
FROM data_export_logs
WHERE timestamp > NOW() - INTERVAL 1 HOUR
GROUP BY user_id
HAVING 
    export_count > 3 OR 
    total_records > 1000
ORDER BY total_records DESC
```

## Sensitive Data Access

### 4. PII Access Monitoring
```sql
SELECT 
    user_id,
    action,
    resource_type,
    COUNT(*) as access_count
FROM audit_logs
WHERE 
    resource_type IN ('employee_data', 'corporate_gift_recipient')
    AND timestamp > NOW() - INTERVAL 7 DAYS
GROUP BY user_id, action, resource_type
HAVING access_count > 10
ORDER BY access_count DESC
```

## Anomalous User Behavior

### 5. Off-Hours Access Detection
```sql
SELECT 
    user_id,
    COUNT(*) as off_hours_access
FROM access_logs
WHERE 
    HOUR(timestamp) NOT BETWEEN 7 AND 20
    AND timestamp > NOW() - INTERVAL 30 DAYS
GROUP BY user_id
HAVING off_hours_access > 5
ORDER BY off_hours_access DESC
```

## Attack Pattern Detection

### 6. Potential Brute Force Indicators
```sql
SELECT 
    ip_address,
    COUNT(DISTINCT username) as usernames_attempted,
    COUNT(*) as total_attempts
FROM login_attempts
WHERE 
    status = 'FAILED' AND
    timestamp > NOW() - INTERVAL 1 HOUR
GROUP BY ip_address
HAVING 
    total_attempts > 20 OR
    usernames_attempted > 3
ORDER BY total_attempts DESC
```

## Recommendation
1. Implement these queries in your SIEM/Log management system
2. Set up automated alerts for suspicious patterns
3. Regularly review and update queries
4. Correlate findings with threat intelligence

---

**Last Updated:** [CURRENT_DATE]
**Version:** 1.0
