Схема работы приложения, развёрнутого на VDS:

sumburovsn.fvds.ru
       │
      Nginx
   ┌───┴────┐
   │        │
 React    PeerJS
          │
        coturn

VDS
│
├── nginx :443
│     ├── React
│     ├── /myapp/ → PeerJS :9000
│     └── /api/   → Room Manager :9100
│
├── PeerJS :9000
├── Room Manager :9100  ← systemd
└── coTURN

Первый                         Room Manager
  │                                │
  │ join AAA111                    │
  ├───────────────────────────────>│
  │ waiting                        │
  │<───────────────────────────────┤
  │                                │
  │ wait AAA111                    │
  ├───────────────────────────────>│
  │ waiting                        │
  │<───────────────────────────────┤
  │                                │
  │             второй входит      │
  │                         BBB222 │
  │                                │
  │ wait AAA111                    │
  ├───────────────────────────────>│
  │ connected + BBB222             │
  │<───────────────────────────────┤
