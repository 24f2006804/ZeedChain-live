import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule("Oracles", (m) => {
  const aiAdvisorIntegration = m.contract("AIAdvisorIntegration", [
    m.getParameter("linkTokenAddress"),
    m.getParameter("oracleAddress")
  ]);

  const financialDataOracle = m.contract("FinancialDataOracle");
  const performanceMetricsOracle = m.contract("PerformanceMetricsOracle");
  const verificationOracle = m.contract("VerificationOracle");

  return {
    aiAdvisorIntegration,
    financialDataOracle,
    performanceMetricsOracle,
    verificationOracle
  };
});