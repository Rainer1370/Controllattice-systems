/// <reference types="@cloudflare/workers-types" />
declare namespace Cloudflare {
  interface Env {
    EXCHANGE_DB?: D1Database;
  }
}
