import os
import xml.etree.ElementTree as ET

root = ET.Element("tv")
sites_dir = "sites"

for filename in os.listdir(sites_dir):
    if filename.endswith(".xml"):
        file_path = os.path.join(sites_dir, filename)
        tree = ET.parse(file_path)
        channel = tree.getroot()

        for ch in channel.findall("channel"):
            display_name = ch.find("display-name").text
            icon_url = ch.find("icon").text if ch.find("icon") is not None else ""
            url = ch.find("url").text if ch.find("url") is not None else ""

            tv_channel = ET.SubElement(root, "channel", id=display_name)
            ET.SubElement(tv_channel, "display-name").text = display_name
            ET.SubElement(tv_channel, "icon").text = icon_url
            ET.SubElement(tv_channel, "url").text = url

tree = ET.ElementTree(root)
tree.write("epg.xml", encoding="UTF-8", xml_declaration=True)
