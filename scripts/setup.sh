#!/bin/bash
# =============================================================
# setup.sh — One-command local environment setup
#
# Run this ONCE after cloning the repository.
# It installs all dependencies and creates your .env file.
#
# Usage: bash scripts/setup.sh
# =============================================================

set -e  # Exit immediately if any command fails

echo ""
echo "============================================"
echo "  uvereann-portfolio — Local Setup"
echo "============================================"
echo ""

# --- Check prerequisites ---
echo "→ Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed."
  echo "   Install it: https://github.com/nvm-sh/nvm"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js version must be 18 or higher. You have: $(node -v)"
  exit 1
fi

echo "✅ Node.js $(node -v)"
echo "✅ npm $(npm -v)"

# --- Backend setup ---
echo ""
echo "→ Installing backend dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created backend/.env from .env.example"
else
  echo "ℹ️  backend/.env already exists — skipping"
fi

cd ..

# --- Frontend setup ---
echo ""
echo "→ Installing frontend dependencies..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"
cd ..

# --- Summary ---
echo ""
echo "============================================"
echo "  ✅ Setup complete!"
echo "============================================"
echo ""
echo "To start the project, open TWO terminals:"
echo ""
echo "  Terminal 1 (backend):"
echo "  $ cd backend && npm run dev"
echo ""
echo "  Terminal 2 (frontend):"
echo "  $ cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "To run tests:"
echo "  $ cd backend && npm test"
echo ""
