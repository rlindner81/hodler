# hodler

## runtime

- https://deno.land/
  - https://deno.land/std
  - https://deno.land/x

```
# install
deno cache --unstable --reload src/server.ts

# run
deno run --unstable --allow-all src/server.ts
```

## data source

- https://stooq.com/db/h/

## dependencies

- https://github.com/hayd/deno-udd

```
deno install -A -f -n udd https://deno.land/x/udd@0.5.0/main.ts

udd src/**/*.ts
```

- 
- DnDB for persistence https://deno.land/x/dndb@0.2.2