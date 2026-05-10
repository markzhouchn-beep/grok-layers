const FEATURES = [
  {
    icon: '🌍',
    title: '全球覆盖，本地发货',
    desc: '通过 Printify 整合美国/欧洲/澳大利亚本地工厂，用户下单后 3-7 个工作日送达，无需跨境物流。',
  },
  {
    icon: '💰',
    title: '版税 8%–45%',
    desc: '根据方案等级，销售额的 8%–45% 作为版税返还给你。卖得越多，版税比例越高。',
  },
  {
    icon: '🎨',
    title: '零风险，零门槛',
    desc: '不需要出任何前期费用，不需要处理包装和发货。有订单才有收入，没订单完全零成本。',
  },
];

export default function WhyLayers() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">为什么选择 Layers</h2>
          <p className="section-subtitle">
            专为独立创作者设计的 POD 平台，没有中间商赚差价
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
