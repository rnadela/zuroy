# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - paragraph [ref=e5]: Zuroy Connect
      - paragraph [ref=e6]: Hotel Staff Portal
    - generic [ref=e7]:
      - alert [ref=e8]:
        - img [ref=e10]
        - generic [ref=e12]: Failed to fetch
      - generic [ref=e13]:
        - generic [ref=e14]:
          - generic [ref=e15]:
            - text: Email
            - generic [ref=e16]: "*"
          - generic [ref=e17]:
            - textbox "Email" [ref=e18]: staff@testhotel.com
            - group:
              - generic: Email *
        - generic [ref=e19]:
          - generic [ref=e20]:
            - text: Password
            - generic [ref=e21]: "*"
          - generic [ref=e22]:
            - textbox "Password" [ref=e23]: StaffPassword123!
            - group:
              - generic: Password *
        - button "Sign In" [ref=e24] [cursor=pointer]: Sign In
  - button "Open Next.js Dev Tools" [ref=e30] [cursor=pointer]:
    - img [ref=e31]
  - alert [ref=e34]
```