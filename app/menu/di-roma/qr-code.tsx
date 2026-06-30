import QRCode from "qrcode";

type Props = { url: string; size?: number; label?: string };

export async function QRCodeBlock({ url, size = 72, label }: Props) {
  const dataUrl = await QRCode.toDataURL(url, {
    width: size * 2,
    margin: 1,
    color: { dark: "#1e1e1e", light: "#faf5ee" },
    errorCorrectionLevel: "M",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <img src={dataUrl} alt="QR Code" width={size} height={size} style={{ borderRadius: 4 }} />
      {label && (
        <p style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: 8,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#7a6f68",
          margin: 0,
          opacity: .7,
          textAlign: "center",
          maxWidth: size,
          lineHeight: 1.2,
        }}>
          {label}
        </p>
      )}
    </div>
  );
}
