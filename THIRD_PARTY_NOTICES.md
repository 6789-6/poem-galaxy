# Third-Party Notices

## chinese-poetry/chinese-poetry

- Source: https://github.com/chinese-poetry/chinese-poetry
- Pinned commit: `b8594f81a89752241442f2ce267d6f66f96704ee`
- License: MIT
- Transformation: the build-time importer reads only the approved classical-poetry directories, normalizes and deduplicates records, applies fixed dynasty quotas and deterministic ordering, infers a restrained theme set, and emits sharded JSON plus a compact search index. Modern works are represented by locally curated title/theme metadata only; no modern poem text is copied from this upstream source or emitted by the importer.

### Upstream LICENSE (verbatim)

```text
The MIT License (MIT)

Copyright (c) 2016 JackeyGao

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
