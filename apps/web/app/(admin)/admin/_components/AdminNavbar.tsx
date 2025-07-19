"use client";

import {
  Box,
  Collapse,
  Group,
  Stack,
  ThemeIcon,
  UnstyledButton,
  Text,
} from "@mantine/core";
import { IconChevronRight, IconUser, IconDashboard } from "@tabler/icons-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const AdminNavbar = () => {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const pathname = usePathname();

  const items: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    childrens?: { label: string; href: string }[];
  }[] = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: <IconDashboard />,
    },
    {
      href: "/admin/users",
      label: "Kullanıcılar",
      icon: <IconUser />,
      childrens: [
        {
          href: "/admin/users",
          label: "Kullanıcı Listesi",
        },
        {
          href: "/admin/users/create",
          label: "Kullanıcı Oluştur",
        },
      ],
    },
  ];

  const handleToggle = (href: string) => {
    setOpen((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const handleNavigation = (href: string, hasChildren: boolean = false) => {
    if (hasChildren) {
      handleToggle(href);
    } else {
      router.push(href);
    }
  };

  const itemComponents = items.map((item) => {
    const hasLinks = item.childrens && item.childrens.length > 0;
    const isOpen = open?.[item.href] || false;
    const isActive =
      pathname === item.href ||
      (hasLinks && item.childrens?.some((child) => pathname === child.href));

    return (
      <Box key={item.href}>
        <UnstyledButton
          onClick={() => handleNavigation(item.href, hasLinks)}
          w="100%"
          p="xs"
          style={{
            borderRadius: "8px",
            backgroundColor: isActive
              ? "var(--mantine-color-primary-6)"
              : "transparent",
            color: isActive ? "white" : "inherit",
          }}
          styles={{
            root: {
              "&:hover": {
                backgroundColor: isActive
                  ? "var(--mantine-color-primary-7)"
                  : "var(--mantine-color-gray-3)",
              },
            },
          }}
        >
          <Group justify="space-between" gap={0}>
            <Box className="flex items-center">
              {item.icon && (
                <ThemeIcon
                  variant={isActive ? "filled" : "light"}
                  size={30}
                  color={isActive ? "white" : "blue"}
                  style={{
                    backgroundColor: isActive
                      ? "transparent"
                      : "var(--mantine-color-blue-0)",
                    color: isActive ? "white" : "var(--mantine-color-blue-6)",
                  }}
                >
                  {item.icon}
                </ThemeIcon>
              )}
              <Text
                ml="md"
                fw={isActive ? 600 : 500}
                c={isActive ? "white" : "dark"}
              >
                {item.label}
              </Text>
            </Box>
            {hasLinks && (
              <IconChevronRight
                stroke={1.5}
                size={16}
                color={isActive ? "white" : "var(--mantine-color-gray-6)"}
                style={{
                  transform: isOpen ? "rotate(90deg)" : "none",
                  transition: "transform 0.2s ease",
                }}
              />
            )}
          </Group>
        </UnstyledButton>

        {hasLinks && (
          <Collapse in={isOpen}>
            <Stack gap="xs" mt="xs" ml="xl">
              {item.childrens?.map((child) => {
                const isChildActive = pathname === child.href;
                return (
                  <UnstyledButton
                    key={child.href}
                    onClick={() => router.push(child.href)}
                    w="100%"
                    p="xs"
                    style={{
                      borderRadius: "6px",
                      backgroundColor: isChildActive
                        ? "var(--mantine-color-primary-6)"
                        : "transparent",
                    }}
                    styles={{
                      root: {
                        "&:hover": {
                          backgroundColor: isChildActive
                            ? "var(--mantine-color-primary-7)"
                            : "var(--mantine-color-gray-3)",
                        },
                      },
                    }}
                  >
                    <Text
                      size="sm"
                      fw={isChildActive ? 600 : 500}
                      c={isChildActive ? "white" : "dimmed"}
                    >
                      {child.label}
                    </Text>
                  </UnstyledButton>
                );
              })}
            </Stack>
          </Collapse>
        )}
      </Box>
    );
  });

  return (
    <Stack gap="xs" p="md">
      {itemComponents}
    </Stack>
  );
};

export default AdminNavbar;
