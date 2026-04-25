import MarketAgentBase from '../../components/hive/MarketAgentBase';
import { MARKET_AGENTS } from '../../lib/marketAgents';

export default function ETFAgent() {
  return <MarketAgentBase config={MARKET_AGENTS.etf} />;
}
