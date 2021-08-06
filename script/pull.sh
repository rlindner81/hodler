#/bin/sh
cd /root/webservers/hodler && \
git pull && \
cd /root/webservers/hodler/frontend && \
yarn --frozen-lockfile && \
yarn build && \
supervisorctl stop hodler && \
cd /root/webservers/hodler/backend && \
deno cache --unstable --reload src/server.ts && \
supervisorctl start hodler
