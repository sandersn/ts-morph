---
title: Renaming
---

## Renaming

Given the source file for following code:

```typescript
enum MyEnum {
    myMember
}

const myVar = MyEnum.myMember;
```

Renaming can be done as follows:

```typescript
const myEnum = sourceFile.getEnum("MyEnum")!;
myEnum.setName("NewEnum");
```

Which will rename `MyEnum` to `NewEnum` across _all_ files.

So the file above would now contain the following code:

```typescript
enum NewEnum {
    myMember
}

const myVar = NewEnum.myMember;
```

### Support

Currently removing is implemented individually for each kind of node. If you find something is not implemented, please open an issue on github.