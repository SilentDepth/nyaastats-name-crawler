<div align=center>
  <h1>Minecraft Player Name Crawler<br>&ZeroWidthSpace;</h1>
  <p>配合 <a href=https://github.com/NyaaCat/NyaaStats>NyaaStats</a> 使用的玩家名称更新工具</p>
</div>

&ZeroWidthSpace;

## 缘起

Mojang [宣布](https://help.minecraft.net/hc/en-us/articles/8969841895693-Username-History-API-Removal-FAQ-) 2022 年 9 月 13 日起玩家历史名称查询 API 永久下线。而 NyaaStats 历史名称功能直接依赖这个 API。因此我们需要别的方式来代替这个 API。

目前找到的办法是通过 UUID to Profile API 获取任意 UUID 的当前名称。理论上只要查询频率足够高，就能手动记录任意 UUID 从当前起的名称修改历史——过去的历史没办法了——虽然听着有点憨，但似乎没有更好的办法了。于是就有了这个程序，它的原理也很直接：遍历 `players.json` 中的 UUID，查询它们的当前名称，手动维护 `names` 字段。

## 用法

Build 或下载预构建文件后：

```sh
node name-crawler.js path/to/players.json

# 只更新 players.json 中前 100 个 UUID 的名称
node name-crawler.js --range 0,100 path/to/players.json

# 使用多个出口地址请求 API（以提高整体效率）
node name-crawler.js path/to/players.json 1.1.1.1 2.2.2.2 3.3.3.3 4.4.4.4
```

### 注意

本程序会**原地更新** `players.json` 的内容，因此需要 `players.json` 的写权限。

提供出口地址时请确保它们确实能被解析为多个公网地址，否则没有意义。
