# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - link "모두쇼핑" [ref=e3] [cursor=pointer]:
      - /url: /
    - button "로그인" [ref=e5]
  - generic [ref=e7]:
    - generic [ref=e8]:
      - heading "전체 상품" [level=1] [ref=e9]
      - paragraph [ref=e10]: 다양한 상품을 만나보세요
    - generic [ref=e13]:
      - generic [ref=e14]: "정렬:"
      - link "최신순" [ref=e16] [cursor=pointer]:
        - /url: /products?
        - button "최신순" [ref=e17]
    - button "더보기" [ref=e85]
  - region "Notifications alt+T"
```