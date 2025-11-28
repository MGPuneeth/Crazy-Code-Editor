interface TemplateItem {
  filename: string;
  fileExtension: string;
  content: string;
  folderName?: string;
  items?: TemplateItem[];
}

interface WebContainerFile {
  file: {
    contents: string;
  };
}

interface WebContainerDirectory {
  directory: {
    [key: string]: WebContainerFile | WebContainerDirectory;
  };
}

type webcontainerFileSystem = Record<
  string,
  WebContainerFile | WebContainerDirectory
>;

export function transformToWebContainerFormat(template: {
  folderName: string;
  items: TemplateItem[];
}): webcontainerFileSystem {
  function processItem(
    item: TemplateItem
  ): WebContainerFile | WebContainerDirectory {
    if (item.folderName && item.items) {
      const directoryContents: webcontainerFileSystem = {};

      item.items.forEach((subItem) => {
        const key = subItem.fileExtension
          ? `${subItem.filename}.${subItem.fileExtension}`
          : subItem.folderName!;

        directoryContents[key] = processItem(subItem);
      });

      return {
        directory: directoryContents,
      };
    } else {
      return {
        file: {
          contents: item.content,
        },
      };
    }
  }

  const result: webcontainerFileSystem = {};

  template.items.forEach((item) => {
    const key = item.fileExtension
      ? `${item.filename}.${item.fileExtension}`
      : item.folderName!;

    result[key] = processItem(item);
  });

  return result;
}
