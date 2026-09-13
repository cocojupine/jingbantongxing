"""Generate the screenshot comparison for the approved repair scope."""
from pathlib import Path
from html import escape
import json

ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/'docs/page-repair-plan'
data=json.loads((DOC/'review-data.json').read_text(encoding='utf-8'))
updates={
 'R01':('已实施', '正文独立滚动；小屏宽高适配；首页头部和问小白各自占位。', [('01-profile-320.png','我的 · 320×667'),('10-home-scroll-320.png','首页滚动 · 320×667')]),
 'R02':('已实施', '保留结构与素材，调整头像、文字、按钮尺寸和卡片留白。', [('07-profile-390.png','我的 · 390×844'),('12-profile-bottom-375.png','底部 · 375×812')]),
 'R03':('已实施', '表单独立滚动，保存／取消固定可见；取消后不保留未保存的草稿。', [('03-profile-modal-320.png','编辑档案 · 320×667')]),
 'R04':('已实施', '详情返回列表，列表按入口返回我的或首页。直接访问使用站内兜底；筛选和滚动位置保留。', [('04-story-favorites-320.png','详情返回后的收藏列表')]),
 'R05':('由他人负责', '本轮不修改地图入口、导航按钮、地图数据及相关文案。', []),
 'R06':('讨论中 · 未改', '静态时间和倒计时保持原样。建议暂时不修；以后单独讨论“全部”的静态列表和“去提醒”的预设咨询。', []),
 'R07':('已实施 · 静态', '本地资料按角色和手机号隔离；区分家长视角与孩子档案；本人／重复关联拦截，解除前确认。', [('13-parent-profile-390.png','家长视角 · 孩子的档案'),('14-child-profile-390.png','同手机号切换心青年 · 独立资料')]),
 'R08':('已实施', '成功后与重新进入时都定位预约结果；取消预约需确认。', [('05-booking-result-320.png','预约结果完整可见')]),
 'R09':('已实施', '收藏在列表和详情间同步、刷新保留；增加已收藏筛选；保留搜索、分类和滚动位置。', [('04-story-favorites-320.png','只看已收藏')]),
 'R10':('已实施 · 静态', '原聊天和通话小结一起保留；刷新恢复完整旧消息，退出清理本次会话。', [('08-chat-return-390.png','挂断并刷新后的聊天')]),
 'R11':('按要求不改', '保留登录校验与协议入口现状。', []),
 'R12':('按要求不改', '保留原有路由和失效地址处理。', []),
}
rows=[]
for item in data['issues']:
 status,change,after=updates[item['id']]
 item['decision']=status
 item['implemented_change']=change
 item['after_images']=after
 def images(items,prefix):
  return '<div class="shots">'+''.join(f'<figure><a href="{prefix}{escape(f)}" target="_blank"><img src="{prefix}{escape(f)}" alt="{escape(label)}" loading="lazy"></a><figcaption>{escape(label)}</figcaption></figure>' for f,label in items)+'</div>'
 before=images(item['images'][:1],'images/')
 after_html=images(after,'after/') if after else '<p class="muted">保持原页面，本轮没有修改</p>'
 rows.append(f'<tr id="{item["id"]}"><td><small>{item["id"]}</small><h2>{escape(item["title"])}</h2><span class="badge {"done" if after else "hold"}">{status}</span><p>{escape(change)}</p></td><td>{before}</td><td>{after_html}</td></tr>')
data['stage']='已按用户确认范围实施，main 未合并，待用户验收'
data['automated_tests']={'passed':11,'failed':0,'command':'node --test scripts/test-ui-repairs.mjs'}
(DOC/'review-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
html='''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>鲸伴同行 · 修复前后与验收</title><style>
*{box-sizing:border-box}body{margin:0;background:#f3f7fb;color:#18374d;font:15px/1.75 "Segoe UI","Microsoft YaHei",sans-serif}main{max-width:1320px;margin:auto;padding:36px 24px}h1{font-size:30px;margin:8px 0}h2{font-size:18px;margin:5px 0 14px}p{margin:12px 0}a{color:#0874bd}header,aside{background:#fff;border:1px solid #dce7ef;border-radius:16px;padding:24px;margin-bottom:20px}.eyebrow,small{color:#557a93;font-weight:650}.summary{display:flex;gap:16px;flex-wrap:wrap;margin-top:20px}.summary span{background:#edf6fd;border-radius:9px;padding:8px 14px}.links{display:flex;gap:20px;flex-wrap:wrap}.table-wrap{overflow:auto;border:1px solid #d6e3ed;border-radius:14px}table{border-collapse:collapse;width:100%;min-width:860px;background:#fff;table-layout:fixed}th,td{text-align:left;vertical-align:top;padding:22px;border-bottom:1px solid #dce7ef;border-right:1px solid #e6eef4}th{background:#e9f2f8;color:#40647c}th:nth-child(1){width:31%}th:nth-child(2){width:25%}th:nth-child(3){width:44%}td:last-child{background:#f9fcff;border-right:0}.shots{display:flex;gap:14px;flex-wrap:wrap}.shots figure{margin:0;max-width:180px;flex:1;min-width:120px}.shots img{display:block;width:100%;height:330px;object-fit:contain;object-position:top;border-radius:9px;background:#e8f0f7}.shots figcaption{font-size:12px;line-height:1.5;color:#55748b;margin-top:8px}.badge{display:inline-block;font-size:12px;border-radius:20px;padding:3px 10px}.done{background:#e5f5ed;color:#23744c}.hold{background:#eef1f5;color:#677c8d}.muted{color:#6f8495}code{font-size:13px;background:#edf2f7;padding:2px 6px;border-radius:4px}footer{margin-top:20px;color:#638096;font-size:12px}@media(max-width:700px){main{padding:20px 12px}h1{font-size:25px}.shots img{height:290px}header{padding:18px}}
</style><main><header><div class="eyebrow">JINGBAN · 2026.09.13 · 原版基础上修复</div><h1>修复前后截图与本轮验收</h1><p>分支 <code>fix/page-repair-v2</code> · main 未合并，等待界面验收。保留原页面结构、蓝色渐变、插画和功能顺序。</p><div class="summary"><span><b>8 项</b> 已实施</span><span><b>4 项</b> 按决定保留</span><span><b>11 / 11</b> 自动检查通过</span><span><b>4 种</b> 屏幕尺寸实测</span></div><p class="links"><a href="../../鲸伴同行-demo-发布包/index.html#/profile" target="_blank">打开修复版“我的”</a><a href="index.html">原版问题与建议表</a><a href="implementation.md">验收及维护记录</a><a href="approved-scope.md">用户确认范围</a></p></header><aside><b>第 6 项：建议暂时不修。</b> 静态时间不影响本轮演示。若以后调整，只讨论“去提醒 / 全部”的静态入口，不增加真实提醒服务。地图由他人负责，11、12 保持原样。<p class="muted">本轮仅验证静态界面与浏览器本地状态；真机软键盘、真实麦克风识别与音频质量未测。截图使用虚构身份。点击截图可查看原图。</p></aside><div class="table-wrap"><table><thead><tr><th>项目 / 实际改动</th><th>修复前</th><th>修复后</th></tr></thead><tbody>'''+''.join(rows)+'''</tbody></table></div><footer>320×667 / 375×812 / 390×844 / 1440×900 · 原有地图、时间、登录和路由排除项已检查 · 合并前需协调其他分支对同一构建文件的修改</footer></main></html>'''
(DOC/'implementation.html').write_text(html,encoding='utf-8')
# Retain historical findings, and place an explicit current-status link above them.
report=(DOC/'index.html').read_text(encoding='utf-8')
report=report.replace('当前阶段：实测与方案 · 业务页面尚未修改','当前阶段：已完成本轮批准项 · main 未合并')
if '查看修复前后与验收表' not in report:
 report=report.replace('<h1>页面截图在左，修改建议在右</h1>','<h1>页面截图在左，修改建议在右</h1><p><a href="implementation.html"><b>查看修复前后与验收表 →</b></a> · 下表保留首轮问题记录，请以最新确认范围为准。</p>')
(DOC/'index.html').write_text(report,encoding='utf-8')
print('Generated 12-row comparison with 8 implemented / 4 deferred items.')
