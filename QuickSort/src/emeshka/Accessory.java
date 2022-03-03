package emeshka;

import javax.swing.*;
import java.io.PrintWriter;
import java.io.StringWriter;

/**
 * Created by Alexandra on 28.02.2018.
 */
public class Accessory {
    ////////////////////////////////////вспомогательная фигня//////////////////////////////
    public static int show(String text) {
        int dialogButton = JOptionPane.YES_NO_OPTION;
        return JOptionPane.showConfirmDialog(null, text, "Warning", dialogButton);
    }

    public static int show(Exception e, String comment) {//сокращение записи
        return show(text(e, comment));
    }

    public static String text(Exception e, String comment) {
        String typeAndMessage = e.toString();
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        String stackTrace = sw.toString();
        return style("\n" + comment + "\n" + typeAndMessage + "\n\nStack trace:\n" + stackTrace,
                "color:red;background-color:#FFC0A3;", "b");
    }

    public static String style(String text, String css, String tag) {
        css = css.replaceAll("[\n\r]", "");
        text = "<html><font style=\"" + css + "\"><" + tag + ">" + text + "</" + tag + "></font></html>";
        return text;
    }

    private Accessory() {}//класс не имеет ентитей, а только статические методы
}
