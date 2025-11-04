
import './globals.css';

export const metadata = {
  title: 'AUTORACK CONNECT',
  description: 'Welcome to AUTORACK CONNECT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

