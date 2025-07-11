#!/bin/bash

echo "Getting your network IP address..."
echo "================================="

# Get the local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "Local IP: $LOCAL_IP"

# Alternative method using ip command
ALT_IP=$(ip route get 1 | awk '{print $7}' | head -1)
echo "Alternative IP: $ALT_IP"

echo ""
echo "To use network access:"
echo "1. Update frontend/.env.local with your IP address"
echo "2. Frontend will be available at: http://$LOCAL_IP:3000"
echo "3. Backend will be available at: http://$LOCAL_IP:5000"
echo ""
echo "Make sure your firewall allows connections on ports 3000 and 5000"
