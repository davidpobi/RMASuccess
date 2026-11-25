import { Body, Column, Container, Head, Html, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { IRmaSubmission } from "@/interfaces/rma";

interface RmaSubmissionMailProps {
  rma: IRmaSubmission;
}

const colors = {
  page: "#eef1f5",
  navy: "#0e1a2b",
  teal: "#3ab5c6",
  muted: "#7a9ab0",
  border: "#e4eaf0",
  shaded: "#f8fafc",
  footer: "#f4f7fa",
};

const sectionLabel: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: "10px",
  fontWeight: 700,
  color: colors.teal,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  border: `1px solid ${colors.border}`,
  borderRadius: "6px",
  borderCollapse: "separate",
  borderSpacing: 0,
  overflow: "hidden",
  marginBottom: "28px",
};

const labelCell: React.CSSProperties = {
  padding: "11px 18px",
  fontSize: "11px",
  fontWeight: 600,
  color: colors.muted,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  borderBottom: `1px solid ${colors.border}`,
  width: "38%",
};

const valueCell: React.CSSProperties = {
  padding: "11px 18px",
  fontSize: "14px",
  color: colors.navy,
  fontWeight: 500,
  borderBottom: `1px solid ${colors.border}`,
};

const DetailTable = ({ rows }: { rows: [string, string][] }) => (
  <table cellPadding={0} cellSpacing={0} role="presentation" style={tableStyle}>
    <tbody>
      {rows.map(([label, value], index) => (
        <tr key={label} style={{ background: index % 2 === 0 ? colors.shaded : "#ffffff" }}>
          <td style={labelCell}>{label}</td>
          <td style={valueCell}>{value || "—"}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const LogoMark = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="13.5" stroke={colors.teal} strokeWidth="1.4" />
    <circle cx="16" cy="16" r="5" stroke={colors.teal} strokeWidth="1.4" />
    <line x1="16" y1="2" x2="16" y2="10.5" stroke={colors.teal} strokeWidth="1.4" strokeLinecap="round" />
    <line x1="16" y1="21.5" x2="16" y2="30" stroke={colors.teal} strokeWidth="1.4" strokeLinecap="round" />
    <line x1="2" y1="16" x2="10.5" y2="16" stroke={colors.teal} strokeWidth="1.4" strokeLinecap="round" />
    <line x1="21.5" y1="16" x2="30" y2="16" stroke={colors.teal} strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="16" cy="16" r="1.5" fill={colors.teal} />
  </svg>
);

export const RmaSubmissionMail = ({ rma }: RmaSubmissionMailProps) => {
  const descriptionLines = rma.customerDescription.split(/\r?\n/);

  return (
    <Html lang="en">
      <Head />
      <Preview>{`RMA #${rma.rmaNumber} — ${rma.customer}`}</Preview>
      <Body
        style={{
          margin: 0,
          padding: "40px 0",
          background: colors.page,
          fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif",
        }}
      >
        <Container style={{ maxWidth: "600px", width: "100%" }}>
          {/* Header */}
          <Section style={{ background: colors.navy, padding: "32px 40px", borderRadius: "8px 8px 0 0" }}>
            <Row>
              <Column style={{ verticalAlign: "middle", width: "48px" }}>
                <LogoMark />
              </Column>
              <Column style={{ verticalAlign: "middle" }}>
                <Text style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#ffffff", lineHeight: "1.2" }}>
                  RMASuccess
                </Text>
                <Text
                  style={{ margin: "2px 0 0", fontSize: "9px", fontWeight: 500, color: colors.muted, letterSpacing: "0.14em" }}
                >
                  MEDICAL DEVICES
                </Text>
              </Column>
              <Column align="right" style={{ verticalAlign: "middle" }}>
                <Text
                  style={{
                    margin: 0,
                    fontSize: "9px",
                    fontWeight: 600,
                    color: colors.teal,
                    letterSpacing: "0.14em",
                    fontFamily: "monospace",
                  }}
                >
                  RMA SUBMISSION
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Teal accent bar */}
          <Section style={{ background: colors.teal, height: "3px", lineHeight: "3px", fontSize: 0 }}>&nbsp;</Section>

          {/* Body */}
          <Section style={{ background: "#ffffff", padding: "40px 40px 32px" }}>
            <Section style={{ borderLeft: `3px solid ${colors.teal}`, paddingLeft: "16px", marginBottom: "32px" }}>
              <Text
                style={{
                  margin: "0 0 4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: colors.muted,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Return Merchandise Authorization
              </Text>
              <Text
                style={{
                  margin: 0,
                  fontSize: "28px",
                  fontWeight: 700,
                  color: colors.navy,
                  letterSpacing: "-0.02em",
                  lineHeight: "1.1",
                }}
              >
                RMA #{rma.rmaNumber}
              </Text>
              <Text style={{ margin: "6px 0 0", fontSize: "15px", color: "#3d566e", fontWeight: 500 }}>{rma.customer}</Text>
            </Section>

            <Text style={sectionLabel}>Return Information</Text>
            <DetailTable
              rows={[
                ["RMA #", rma.rmaNumber],
                ["Customer", rma.customer],
                ["Date Opened", rma.dateOpened],
                ["Initial", rma.initial],
                ["RMA Type", rma.rmaType],
              ]}
            />

            <Text style={sectionLabel}>Product Details</Text>
            <DetailTable
              rows={[
                ["Product Name", rma.productName],
                ["Model #", rma.modelNumber],
                ["Product Line", rma.productLine],
                ["Qty Returned", rma.quantityReturned],
                ["Serial / Lot #", rma.serialLotNumber],
              ]}
            />

            <Text style={sectionLabel}>Customer Description</Text>
            <table cellPadding={0} cellSpacing={0} role="presentation" style={{ ...tableStyle, marginBottom: "8px" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "16px 18px", fontSize: "14px", color: "#1e3347", lineHeight: "1.6" }}>
                    {descriptionLines.map((line, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <br />}
                        {line}
                      </React.Fragment>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Footer */}
          <Section
            style={{
              background: colors.footer,
              padding: "20px 40px",
              borderRadius: "0 0 8px 8px",
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <Row>
              <Column>
                <Text style={{ margin: 0, fontSize: "11px", color: colors.muted, lineHeight: "1.6" }}>
                  This is an automated notification from the RMASuccess portal.
                  <br />
                  Do not reply to this email.
                </Text>
              </Column>
              <Column align="right" style={{ verticalAlign: "middle" }}>
                <Text
                  style={{
                    margin: 0,
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#b0bec8",
                    letterSpacing: "0.1em",
                    fontFamily: "monospace",
                  }}
                >
                  RMASuccess
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default RmaSubmissionMail;
