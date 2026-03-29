# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - paragraph [ref=e5]: ZUROY
    - paragraph [ref=e6]: Admin Portal
    - alert [ref=e7]:
      - img [ref=e9]
      - generic [ref=e11]: Failed to fetch
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]:
          - text: Email
          - generic [ref=e15]: "*"
        - generic [ref=e16]:
          - textbox "Email" [ref=e17]: admin@zuroy.com
          - group:
            - generic: Email *
      - generic [ref=e18]:
        - generic [ref=e19]:
          - text: Password
          - generic [ref=e20]: "*"
        - generic [ref=e21]:
          - textbox "Password" [ref=e22]: AdminPassword123!
          - group:
            - generic: Password *
      - button "Sign In" [ref=e23] [cursor=pointer]: Sign In
  - button "Open Next.js Dev Tools" [ref=e29] [cursor=pointer]:
    - img [ref=e30]
  - alert [ref=e33]
```