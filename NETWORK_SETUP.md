# Network Access Configuration

This guide explains how to configure your Flipkart clone to be accessible from other devices on your network.

## What's Been Configured

### Frontend (Next.js)
- ✅ Next.js dev server configured to accept connections from any network address (`-H 0.0.0.0`)
- ✅ Proxy configuration added to forward `/api/*` requests to the backend
- ✅ CORS and image loading configured for network access

### Backend (Express.js)
- ✅ Server configured to listen on all network interfaces (`0.0.0.0`)
- ✅ CORS middleware already enabled

## Setup Instructions

### 1. Find Your Network IP Address

Run the provided script to get your network IP:

```bash
./get-network-ip.sh
```

Or manually find it:
```bash
hostname -I | awk '{print $1}'
```

### 2. Update Environment Variables

Edit `frontend/.env.local` and update the IP addresses:

```bash
# Replace 192.168.1.100 with your actual IP address
BACKEND_URL=http://192.168.1.100:5000
NEXT_PUBLIC_API_URL=http://192.168.1.100:5000/api
```

### 3. Start the Servers

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### 4. Access Your Application

- **Frontend**: `http://YOUR_IP:3000`
- **Backend API**: `http://YOUR_IP:5000`

Replace `YOUR_IP` with your actual network IP address.

## Firewall Configuration

### Ubuntu/Debian
```bash
sudo ufw allow 3000
sudo ufw allow 5000
```

### CentOS/RHEL
```bash
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --add-port=5000/tcp --permanent
sudo firewall-cmd --reload
```

### Windows (Windows Firewall)
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Add inbound rules for ports 3000 and 5000

## Troubleshooting

### Can't Access from Other Devices?

1. **Check if servers are running on correct interface**:
   ```bash
   netstat -tlnp | grep :3000
   netstat -tlnp | grep :5000
   ```

2. **Verify firewall rules**:
   ```bash
   sudo ufw status
   ```

3. **Test connectivity**:
   ```bash
   # From another device
   curl http://YOUR_IP:5000/api/products
   ```

### Common Issues

- **Port already in use**: Change ports in package.json scripts
- **Network unreachable**: Check if devices are on the same network
- **API calls failing**: Verify BACKEND_URL in .env.local matches your server IP

## Security Notes

⚠️ **Important**: This configuration is for development only. For production:
- Use proper domain names
- Configure SSL/TLS certificates
- Set up proper firewall rules
- Use environment-specific configurations

## Network Architecture

```
Other Device (192.168.1.50)
       ↓
Your Computer (192.168.1.100)
       ↓
Frontend (port 3000) → Backend (port 5000)
       ↓
Database (MongoDB)
```

The proxy configuration in `next.config.ts` automatically forwards all `/api/*` requests from the frontend to the backend, so other devices can access your full application seamlessly.
