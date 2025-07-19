"use client";
import { AppShell, Avatar, Burger, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { TokenPayload } from "@repo/types";

import React from "react";
import { getRoleLabel } from "../../../../lib/helper";
import AdminNavbar from "./AdminNavbar";

const AdminLayoutShell = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: TokenPayload;
}) => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header bg={"gray.1"}>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar bg={"gray.1"} p="md" className="flex flex-col gap-3">
        <Group>
          <Avatar radius={"xl"} />
          <div className="flex-1">
            <Text fz={"sm"} fw={500}>
              {session.name} - {getRoleLabel(session.role)}
            </Text>
            <Text c={"gray.7"} size="xs" fw={700}>
              {session.email ? session.email : session.phone}
            </Text>
          </div>
        </Group>
        <AdminNavbar />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default AdminLayoutShell;
