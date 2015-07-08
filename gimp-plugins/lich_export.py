#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
LICH config file export
Peter Chaplin, July 2015

Initially based on info_layers by Robert Brizard
================================================================================
 You may use and distribute this plug-in under the terms of the GPL 2 or greater.
 Get the license text at "http://www.gnu.org/licenses/" 
"""

import gtk, os, json
from gimpfu import *
from gimpshelf import shelf

def traverse(layer, path, offset_x, offset_y):
    modes = {
        NORMAL_MODE: "normal",
        MULTIPLY_MODE: "multiply",
        ADDITION_MODE: "lighter",
        SCREEN_MODE: "screen",
        OVERLAY_MODE: "overlay",
        DARKEN_ONLY_MODE: "darken",
        LIGHTEN_ONLY_MODE: "lighten",
        DODGE_MODE: "color-dodge",
        BURN_MODE: "burn",
        HARDLIGHT_MODE: "hard-light",
        SOFTLIGHT_MODE: "soft-light",
        DIFFERENCE_MODE: "difference",
        SUBTRACT_MODE: "exclusion",
        HUE_MODE: "hue",
        SATURATION_MODE: "saturation",
        COLOR_MODE: "color",
        VALUE_MODE: "luminosity"
    }
    config = {}
    source = path + layer.name
    if hasattr(layer,"layers"):
        config["layers"] = []
        for L in reversed(layer.layers):
            config["layers"].append(traverse(L, source + "/", layer.offsets[0], layer.offsets[1]))
        config["type"] = "group"
        config["source"] = source
    else:
        config["type"] = "single"
        config["source"] = source + ".png"
    if layer.mode in modes:
        config["mode"] = modes[layer.mode]
    config["offset"] = [
        layer.offsets[0] - offset_x,
        layer.offsets[1] - offset_y
    ]
    return config

def save_file(img, draw) :    
    config = {}
    config["layers"] = []
    for L in reversed(img.layers):
        config["layers"].append(traverse(L, "", 0, 0))
        config["height"] = img.height
        config["width"] = img.width

    chooser = gtk.FileChooserDialog(title="User file selection",
                                    action=gtk.FILE_CHOOSER_ACTION_SAVE,
                                    buttons=(gtk.STOCK_CANCEL, gtk.RESPONSE_CANCEL,
                                             gtk.STOCK_SAVE, gtk.RESPONSE_OK))
    chooser.set_current_name(os.path.basename("config.jsonp"))
    
    response = chooser.run()
    if response != gtk.RESPONSE_OK:
        chooser.destroy()
        gimp.message(_("INFO: save was aborted by the user"))
        return
        
    filename = chooser.get_filename()
    if filename:
        try:
            file_obj = open(filename, "w")
            file_obj.write("var config = " + json.dumps(config, indent=4, separators=(',', ': ')));
            file_obj.close()
        except:
            gimp.message("ERROR in saving file: " + filename)
            
    else: gimp.message("ERROR: no file-name given!")
    
    chooser.destroy()
    return

register(
    'lich_export',
    'Export layers to images and create a LICH config file',
    'Export layers to images and create a LICH config file',
    'Peter Chaplin',
    'Peter Chaplin',
    '2015',
    '<Image>/Extensions/Lich Export',
    '*',
    [],
    [],
    save_file
)

main() 
