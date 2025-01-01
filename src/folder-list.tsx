import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActionIcon,
  Button,
  Flex,
  Group,
  Input,
  Modal,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useDatabase } from "./DbProvider";
import { getFolders, createNewFolder } from "./db";
import { useRef, useState } from "react";
import classes from "./folder-list.module.css";
import { getSelectedFolderId } from "./helpers";

export default function FolderList({
  forceUpdate,
}: {
  forceUpdate: () => void;
}) {
  const [showNewFolderNameModal, setShowNewFolderNameModal] = useState(false);
  const db = useDatabase();
  const queryClient = useQueryClient();

  const { data: folders, refetch } = useQuery({
    queryKey: ["folders"],
    queryFn: () => getFolders(db),
    enabled: !!db,
  });
  function handleNewFolderClick() {
    setShowNewFolderNameModal(true);
  }
  const handeNewFolderModalClose = () => {
    setShowNewFolderNameModal(false);
  };
  const handleNewFolderSubmit = async (name: string) => {
    if (db && name) {
      await createNewFolder(db, name);
      refetch();
    } else {
      // TODO
    }
    setShowNewFolderNameModal(false);
  };
  function handleSelectFolderClick(id: number) {
    localStorage.setItem("excalidraw-organizer-selected-folder-id", String(id));
    setSelectedFolderId(id);
    queryClient.invalidateQueries({ queryKey: ["folders"] });
    // Force updating from the top because otherwise the canvases for
    // the selected folders won't get updated
    // Simply invalidating the query won't trigger a re-render
    // Invalidating a query only makes sure that a refetch is triggered
    // if the hook is called again
    forceUpdate();
  }
  const [selectedFolderId, setSelectedFolderId] = useState(
    getSelectedFolderId(),
  );

  return (
    <Stack style={{ width: 250 }}>
      <Flex align="center" justify="space-between" px="xs">
        <Text>Folders</Text>
        <ActionIcon
          onClick={handleNewFolderClick}
          aria-label="New Folder"
          variant="light"
        >
          <IconPlus fill="none" />
        </ActionIcon>
      </Flex>
      <Stack gap={0}>
        {folders?.map((folder) => (
          <UnstyledButton
            key={folder.id}
            px="xs"
            className={classes.item}
            data-active={folder.id === selectedFolderId || undefined}
            onClick={handleSelectFolderClick.bind(null, folder.id)}
          >
            {folder.name}
          </UnstyledButton>
        ))}
      </Stack>
      {showNewFolderNameModal && folders ? (
        <NewFolderModal
          onClose={handeNewFolderModalClose}
          onSubmit={handleNewFolderSubmit}
        />
      ) : null}
    </Stack>
  );
}

type NewFolderModalProps = {
  onClose: () => void;
  onSubmit: (name: string) => void;
};
function NewFolderModal({ onClose, onSubmit }: NewFolderModalProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const handleCreateClick = () => {
    if (nameInputRef.current) {
      onSubmit(nameInputRef.current.value);
    }
  };
  return (
    <Modal opened={true} onClose={onClose} title="New Folder" centered>
      <Stack gap={12}>
        <Input placeholder="Enter folder name" ref={nameInputRef} />
        <Group style={{ flexDirection: "row-reverse" }} gap={8}>
          <Button onClick={handleCreateClick}>Create</Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
