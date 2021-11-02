
const toBigInt = n => {
  try {
    return BigInt(n);
  } catch (e) {
    return 0n;
  }
};

const propBigInt = (prop) => ({
  get() {
    return toBigInt(this[prop]);
  },
  set(n) {
    this[prop] = n.toString();
  },
});

function watchers(watchers) {
  const listenerLists = {};
  for (const [name, watcher] of Object.entries(watchers)) {
    for (const prop of watcher.sensitive) {
      if (!listenerLists[prop]) listenerLists[prop] = [];
      listenerLists[prop].push([name, watcher.update]);
    }
  }
  const obj = {};
  for (const [prop, listenerList] of Object.entries(listenerLists)) {
    obj[prop] = function () {
      for (const [name, listener] of listenerList) {
        this[name] = listener.call(this);
      }
    };
  }
  return obj;
}

function mod(n) {
  if (app.useModulus) return (n % app.modulus + app.modulus) % app.modulus;
  return n;
}

function div(a, b) {
  if (app.useModulus) return a * inv(b) % app.modulus;
  return a / b;
}

function power(n, r) {
  let x = 1n;
  let y = n;
  while (r > 0n) {
    if ((r & 1n) != 0n) {
      x = mod(x * y);
    }
    y = mod(y * y);
    r >>= 1n;
  }
  return x;
}

function inv(n) {
  if (!app.useModulus) return 1n / n;
  return inv_gcd(n, app.modulus)[1];
}

function inv_gcd(a, b) {
  a %= b;
  let [s, t] = [b, a];
  let [m0, m1] = [0n, 1n];
  while (t > 0n) {
    let u = s / t;
    s -= t * u;
    m0 -= m1 * u;
    [s, t] = [t, s];
    [m0, m1] = [m1, m0];
  }
  if (m0 < 0n) m0 += b / s;
  return [s, m0];
}

function permutation(n, r) {
  let x = 1n;
  for (let i = n - r + 1n; i <= n; i++) {
    x = mod(x * i);
  }
  return x;
}

function binomial(n, r) {
  let x = 1n;
  for (let i = 0n; i < r; i++) {
    x *= n - i;
    x /= i + 1n;
  }
  return mod(x);
}

// 正整数 N を K 個以下の非負整数で表す方法の数
function part(N, K) {
  const P = [];
  for (let n = 0n; n <= N; n++) {
    P[n] = [0n];
  }
  P[0n][0n] = 1n;
  for (let n = 0n; n <= N; n++) {
    for (let k = 1n; k <= K; k++) {
      if (n >= k) {
        P[n][k] = mod(P[n][k - 1n] + P[n - k][k]);
      } else {
        P[n][k] = P[n][k - 1n];
      }
    }
  }
  return P;
}

function partition(n, k) {
  if (n < k) return 0n;
  if (k == 0n) return n == 0n ? 1n : 0n;
  const P = part(n, k);
  return mod(P[n][k] - P[n][k - 1n]);
}

class Combination {
  constructor(n) {
    this.fact = [1n, 1n];
    this.rfact = [1n, 1n];
    this.inv = [, 1n];
    for (let i = 2n; i <= n; i++) {
      this.fact[i] = mod(this.fact[i - 1n] * i);
      this.inv[i] = app.modulus - this.inv[app.modulus % i] * (app.modulus / i) % app.modulus;
      this.rfact[i] = mod(this.rfact[i - 1n] * this.inv[i]);
    }
  }

  C(n, r) {
    if (n < r) return 0n;
    if (n < 0n || r < 0n) return 0n;
    return mod(mod(this.fact[n] * this.rfact[r]) * this.rfact[n - r]);
  }
}


// ベル数
function bell(n, k) {
  if (n == 0n) return 1n;
  if (k > n) k = n;
  const com = new Combination(k);
  let ret = 0n;
  const pref = [1n];
  for (let i = 1n; i <= k; i++) {
    if ((i & 1n) != 0n) pref[i] = mod(pref[i - 1n] - com.rfact[i]);
    else pref[i] = mod(pref[i - 1n] + com.rfact[i]);
  }
  for (let i = 1n; i <= k; i++) {
    ret += mod(power(i, n) * com.rfact[i]) * pref[k - i];
  }
  return mod(ret);
}

// 第2種スターリング数
function stirling2nd(n, k) {
  const com = new Combination(k);
  let ret = 0n;
  for (let i = 0n; i <= k; i++) {
    const add = mod(power(i, n) * com.C(k, i));
    if ((k - i & 1n) != 0n) ret -= add;
    else ret += add;
  }
  return mod(ret * com.rfact[k]);
}

const app = new Vue({
  el: "#app",
  data: {
    useModulus: true,
    modulusText: "1000000007",
    powerNText: "0",
    powerRText: "0",
    power: 1n,
    invNText: "1",
    inv: 1n,
    factorialNText: "0",
    factorial: 1n,
    binomialNText: "0",
    binomialRText: "0",
    binomial: 1n,
    permutationNText: "0",
    permutationRText: "0",
    permutation: 1n,
    homoNText: "0",
    homoRText: "0",
    homo: 1n,
    partitionNText: "0",
    partition: 1n,
    partition2NText: "0",
    partition2KText: "0",
    partition2: 1n,
    partition2leNText: "0",
    partition2leKText: "0",
    partition2le: 1n,
    bellNText: "0",
    bell: 1n,
    bell2NText: "0",
    bell2KText: "0",
    bell2: 1n,
    stirling2ndNText: "0",
    stirling2ndKText: "0",
    stirling2nd: 1n,
    stirling2ndFactNText: "0",
    stirling2ndFactKText: "0",
    stirling2ndFact: 1n,
    twelvefoldWayNText: "0",
    twelvefoldWayKText: "0",
    twelvefoldWayUU01: 1n,
    twelvefoldWayUU: 1n,
    twelvefoldWayUU1p: 1n,
    twelvefoldWayUD01: 1n,
    twelvefoldWayUD: 1n,
    twelvefoldWayUD1p: 1n,
    twelvefoldWayDU01: 1n,
    twelvefoldWayDU: 1n,
    twelvefoldWayDU1p: 1n,
    twelvefoldWayDD01: 1n,
    twelvefoldWayDD: 1n,
    twelvefoldWayDD1p: 1n,
  },
  computed: {
    modulus: propBigInt("modulusText"),
    powerN: propBigInt("powerNText"),
    powerR: propBigInt("powerRText"),
    invN: propBigInt("invNText"),
    factorialN: propBigInt("factorialNText"),
    binomialN: propBigInt("binomialNText"),
    binomialR: propBigInt("binomialRText"),
    permutationN: propBigInt("permutationNText"),
    permutationR: propBigInt("permutationRText"),
    homoN: propBigInt("homoNText"),
    homoR: propBigInt("homoRText"),
    partitionN: propBigInt("partitionNText"),
    partition2N: propBigInt("partition2NText"),
    partition2K: propBigInt("partition2KText"),
    partition2leN: propBigInt("partition2leNText"),
    partition2leK: propBigInt("partition2leKText"),
    bellN: propBigInt("bellNText"),
    bell2N: propBigInt("bell2NText"),
    bell2K: propBigInt("bell2KText"),
    stirling2ndN: propBigInt("stirling2ndNText"),
    stirling2ndK: propBigInt("stirling2ndKText"),
    stirling2ndFactN: propBigInt("stirling2ndFactNText"),
    stirling2ndFactK: propBigInt("stirling2ndFactKText"),
    twelvefoldWayK: propBigInt("twelvefoldWayKText"),
    twelvefoldWayN: propBigInt("twelvefoldWayNText"),
  },
  watch: watchers({
    power: {
      sensitive: ["useModulus", "modulus", "powerN", "powerR"],
      update() {
        const n = this.powerN;
        const r = this.powerR;
        return power(n, r);
      },
    },
    inv: {
      sensitive: ["useModulus", "modulus", "invN"],
      update() {
        const n = this.invN;
        return inv(n);
      },
    },
    factorial: {
      sensitive: ["useModulus", "modulus", "factorialN"],
      update() {
        const n = this.factorialN;
        return permutation(n, n);
      }
    },
    binomial: {
      sensitive: ["useModulus", "modulus", "binomialN", "binomialR"],
      update() {
        const n = this.binomialN;
        const r = this.binomialR;
        return binomial(n, r);
      },
    },
    permutation: {
      sensitive: ["useModulus", "modulus", "permutationN", "permutationR"],
      update() {
        const n = this.permutationN;
        const r = this.permutationR;
        return permutation(n, r);
      },
    },
    homo: {
      sensitive: ["useModulus", "modulus", "homoN", "homoR"],
      update() {
        const n = this.homoN;
        const r = this.homoR;
        return binomial(n + r - 1n, r);
      }
    },
    partition: {
      sensitive: ["useModulus", "modulus", "partitionN"],
      update() {
        const n = this.partitionN;
        const P = part(n, n);
        return mod(P[n][n]);
      },
    },
    partition2: {
      sensitive: ["useModulus", "modulus", "partition2N", "partition2K"],
      update() {
        const n = this.partition2N;
        const k = this.partition2K;
        return partition(n, k);
      },
    },
    partition2le: {
      sensitive: ["useModulus", "modulus", "partition2leN", "partition2leK"],
      update() {
        const n = this.partition2N;
        const k = this.partition2K;
        const P = part(n, k);
        return P[n][k];
      },
    },
    bell: {
      sensitive: ["useModulus", "modulus", "bellN"],
      update() {
        const n = this.bellN;
        return bell(n, n);
      },
    },
    bell2: {
      sensitive: ["useModulus", "modulus", "bell2N", "bell2K"],
      update() {
        const n = this.bell2N;
        const k = this.bell2K;
        return bell(n, k);
      },
    },
    stirling2nd: {
      sensitive: ["useModulus", "modulus", "stirling2ndN", "stirling2ndK"],
      update() {
        const n = this.stirling2ndN;
        const k = this.stirling2ndK;
        return stirling2nd(n, k);
      },
    },
    stirling2ndFact: {
      sensitive: ["useModulus", "modulus", "stirling2ndFactN", "stirling2ndFactK"],
      update() {
        const n = this.stirling2ndFactN;
        const k = this.stirling2ndFactK;
        return mod(permutation(k, k) * stirling2nd(n, k));
      },
    },
    twelvefoldWayDD01: {
      sensitive: ["useModulus", "modulus", "twelvefoldWayK", "twelvefoldWayN"],
      update() {
        const k = this.twelvefoldWayK;
        const n = this.twelvefoldWayN;
        return permutation(k, n);
      },
    },
    twelvefoldWayDD: {
      sensitive: ["useModulus", "modulus", "twelvefoldWayK", "twelvefoldWayN"],
      update() {
        const k = this.twelvefoldWayK;
        const n = this.twelvefoldWayN;
        return power(k, n);
      },
    },
    twelvefoldWayDD1p: {
      sensitive: ["useModulus", "modulus", "twelvefoldWayK", "twelvefoldWayN"],
      update() {
        const k = this.twelvefoldWayK;
        const n = this.twelvefoldWayN;
        return mod(permutation(k, k) * stirling2nd(n, k));
      },
    },
    twelvefoldWayDU01: {
      sensitive: ["useModulus", "modulus", "twelvefoldWayK", "twelvefoldWayN"],
      update() {
        const k = this.twelvefoldWayK;
        const n = this.twelvefoldWayN;
        return binomial(k, n);
      },
    },
    twelvefoldWayDU: {
      sensitive: ["useModulus", "modulus", "twelvefoldWayK", "twelvefoldWayN"],
      update() {
        const k = this.twelvefoldWayK;
        const n = this.twelvefoldWayN;
        return binomial(k + n - 1n, n);
      },
    },
    twelvefoldWayDU1p: {
      sensitive: ["useModulus", "modulus", "twelvefoldWayK", "twelvefoldWayN"],
      update() {
        const k = this.twelvefoldWayK;
        const n = this.twelvefoldWayN;
        return binomial(n - 1n, k - 1n);
      },
    },
    twelvefoldWayUD01: {
      sensitive: ["useModulus", "modulus", "twelvefoldWayK", "twelvefoldWayN"],
      update() {
        const k = this.twelvefoldWayK;
        const n = this.twelvefoldWayN;
        return (k >= n) ? 1n : 0n;
      },
    },
    twelvefoldWayUD: {
      sensitive: ["useModulus", "modulus", "twelvefoldWayK", "twelvefoldWayN"],
      update() {
        const k = this.twelvefoldWayK;
        const n = this.twelvefoldWayN;
        return bell(n, k);
      },
    },
    twelvefoldWayUD1p: {
      sensitive: ["useModulus", "modulus", "twelvefoldWayK", "twelvefoldWayN"],
      update() {
        const k = this.twelvefoldWayK;
        const n = this.twelvefoldWayN;
        return stirling2nd(n, k);
      },
    },
    twelvefoldWayUU01: {
      sensitive: ["useModulus", "modulus", "twelvefoldWayK", "twelvefoldWayN"],
      update() {
        const k = this.twelvefoldWayK;
        const n = this.twelvefoldWayN;
        return (k >= n) ? 1n : 0n;
      },
    },
    twelvefoldWayUU: {
      sensitive: ["useModulus", "modulus", "twelvefoldWayK", "twelvefoldWayN"],
      update() {
        const k = this.twelvefoldWayK;
        const n = this.twelvefoldWayN;
        return partition(n, k);
      },
    },
    twelvefoldWayUU1p: {
      sensitive: ["useModulus", "modulus", "twelvefoldWayK", "twelvefoldWayN"],
      update() {
        const k = this.twelvefoldWayK;
        const n = this.twelvefoldWayN;
        return partition(n - k, k);
      },
    },
  }),
});