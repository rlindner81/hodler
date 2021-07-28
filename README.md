# hodler

## runtime

- https://deno.land/
  - https://deno.land/std
  - https://deno.land/x

```
# install
deno cache --unstable --reload src/server.ts

# run server
deno run --unstable --allow-all src/server.ts

#  run options-quotes
deno run --unstable --allow-all src/misc/options-quotes.ts
```

## data source

- https://stooq.com/db/h/

## dependencies

- https://github.com/hayd/deno-udd

```
# update setup
deno install -A -f -n udd https://deno.land/x/udd@0.5.0/main.ts

# update dependencies
udd src/**/*.ts
deno cache --unstable --reload src/server.ts

# format files
deno fmt src/**/*.ts 
```

- 
- DnDB for persistence https://deno.land/x/dndb@0.2.2