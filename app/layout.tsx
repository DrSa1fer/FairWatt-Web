"use client";

import '../CONSTANTS'; // Обеспечивает инициализацию значения констант
import { Button, Layout, Popconfirm, Image, ConfigProvider, Menu, MenuProps, Typography, Space, Spin } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import "./globals.css";
import Link from "next/link";
import Paragraph from "antd/es/typography/Paragraph";
import { usePathname, useRouter } from "next/navigation";
import '@ant-design/v5-patch-for-react-19';
import { useEffect, useState } from "react";
import { CaretDownOutlined, SettingOutlined, LineChartOutlined, HomeOutlined, InsertRowAboveOutlined, BarChartOutlined, SlidersOutlined } from '@ant-design/icons';
import { hasTokenInCookies, removeTokenFromCookies } from "./services/user-access";
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

const { Text } = Typography;

<ConfigProvider
  theme={{
    components: {
      Menu: {
        itemColor: 'white',
        subMenuItemBg: 'white',
        itemSelectedColor: 'white',
      },
    },
  }}
></ConfigProvider>

type MenuItem = Required<MenuProps>['items'][number];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authDate, setAuthDate] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (!hasTokenInCookies() && !pathname.startsWith("/registration")) {
      router.replace("/auth");
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    dayjs.locale('ru');
  }, []);
  

  // Главная страница нужна для переадресации, поэтому у неё отключен Layout
  if (pathname === "/") {
    return (
      <html lang="en">
        <body style={{ background: "transparent" }}>
          <ConfigProvider locale={ruRU}>
            {children}
          </ConfigProvider>
        </body>
      </html>
    );
  }

  // Если пользователь не авторизован его перенаправит на авторизацию
  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body style={{ background: "transparent" }}>
          <ConfigProvider locale={ruRU}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
              <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: 50 }} />
            </div>
          </ConfigProvider>
        </body>
      </html>
    );
  }

  const items: MenuItem[] = [
    // {
    //   key: 'main',
    //   label: <Link href={"/"}><Image src='/logo.png' width={200} preview={false} alt='Логотип' /></Link>,
    // },
    {
      key: "meterList",
      label: <Link href={"/meterList"}>Список счетчиков</Link>,
      icon: <InsertRowAboveOutlined />
    },
    {
      key: "consumptionChart",
      label: <Link href={"/consumptionChart"}>График общего потребления</Link>,
      icon: <SlidersOutlined />
    }
  ];

  return (
    <html lang="ru">
      <body>
        <Layout style={{ minHeight: "100vh", background: "transparent" }}>
          <Header style={{ background: "transparent" }}>
            <Menu
              theme="dark"
              mode="horizontal"
              items={items}
              style={{
                flex: 1,
                minWidth: 0,
                background: "transparent",
              }}
            />
          </Header>
          <Content style={{ padding: "0 48px", background: "transparent" }}>
            <ConfigProvider locale={ruRU}>
              {children}
            </ConfigProvider>
          </Content>
          <Footer style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            background: "transparent",
            minHeight: '64px'
          }}>
            <Paragraph style={{
              color: "white",
              margin: 0,
              textAlign: 'center',
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              © Честный киловатт {(new Date).getFullYear()} <br />
              <b>Эльбрус</b>
            </Paragraph>

            <Paragraph style={{
              color: "white",
              margin: 0,
              textAlign: 'right',
              position: 'relative',
              zIndex: 1
            }}>
              <b>{userName}</b> <br />
              {authDate}
            </Paragraph>
          </Footer>
        </Layout>
      </body>
    </html>
  );
}
