#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Ensure local node binary is available in PATH
if [ -d "$DIR/.node/bin" ]; then
  export PATH="$DIR/.node/bin:$PATH"
fi

echo "ॐ Starting PujaConnect server on port 5500..."
node "$DIR/server.js"
