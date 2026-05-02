class Pool {
  constructor(config) { this.config = config }
  connect() { return Promise.resolve(this) }
  query() { return Promise.resolve({ rows: [], rowCount: 0 }) }
  end() { return Promise.resolve() }
}

class Client {
  constructor(config) { this.config = config }
  connect() { return Promise.resolve(this) }
  query() { return Promise.resolve({ rows: [], rowCount: 0 }) }
  end() { return Promise.resolve() }
}

module.exports = { Pool, Client, native: null }