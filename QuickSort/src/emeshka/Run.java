package emeshka;

import com.google.gson.Gson;
import javafx.application.Platform;
import javafx.embed.swing.JFXPanel;
import javafx.event.EventHandler;
import javafx.scene.Scene;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebEvent;
import javafx.scene.web.WebView;
import netscape.javascript.JSObject;

import javax.swing.*;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;

/**
 * Created by Alexandra on 28.02.2018.
 */
public class Run {
    private static JFrame window = new JFrame("Test QuickSort");
    public static WebView wv = null;
    public static WebEngine engine = null;//js engine
    public static Bridge bridge = null;//js engine
    private static final String root = getRoot();//absolute path to directory with our executing program
    private static final String GUI = "gui.html";//gui. Lies nearby executive file

    private static String getRoot() {
        String root = null;
        try {
            root = (new File(Run.class.getProtectionDomain().getCodeSource().getLocation().toURI()))
                    .getParentFile().getParentFile().getParentFile().getParentFile().getPath();
        } catch (URISyntaxException e) {
            Accessory.show(e, "tried to get root :(");
        }
        return root;
    }

    public static class Bridge {
        public String qs(String request) {
            //System.out.println("Run.Bridge.qs() got input:\n\'" + request + "\'");
            Gson gson = new Gson();
            int[] a = gson.fromJson(request, int[].class);
            QuickSort.quickSort(a);
            //System.out.println("qs can make a reply");
            String reply = gson.toJson(a);
            //System.out.println("Run.Bridge.qs(): json string reply=\'" + reply + "\'");
            return reply;
        }

        public void show(String s) {
            Accessory.show(s);
        }

        public void exit() {//close by option within program
            int dialogResult = Accessory.show("Sure to exit?");
            if (dialogResult == JOptionPane.YES_OPTION) {
                System.exit(0);
            }
        }
    }

    public static void sendChanges() {
        String states = new Gson().toJson(QuickSort.states);
        //System.out.println("Run.Bridge.sendChanges(): json string states=\'" + states + "\'");
        //System.out.println(engine);

        JSObject jsWindow = (JSObject) engine.executeScript("window");
        //System.out.println("jsWindow");
        jsWindow.setMember("_sendChangesReply", states);
        //engine.executeScript("t()");
        //String name = (String) jsFunc.getMember("name");
        //int len = (int) jsFunc.getMember("length");
        //System.out.println("func name: "+name+"\n length: " + len);
        //engine.executeScript("getStateObj('"+states+"')");
        //System.out.println("getStateObj() executed");
    }

    public static void loadPage(File f) {
        try {
            if (!f.exists()) throw new IOException("No such a file");
            engine.load(f.toURI().toURL().toString());
            //JSObject javaVar = (JSObject) jsobj.getMember("java");
            //Accessory.show("func name: " + javaVar.toString());
            //if (p != null) jsobj.setMember("parameter", p);
        } catch (MalformedURLException e) {
            Accessory.show(e, "Error when loading page '" + f.getAbsolutePath() + "': ");
        } catch (IOException e) {
            Accessory.show(e, "Please make sure that "+f.getAbsolutePath()+" exists and restart the program!");
        }
    }

    //отладочная функция для теста, есть ли контакт js-java
    /*public static void test() {
        System.out.println("test");
        engine.executeScript("document.getElementById('error').innerHTML = 'Run.test<br>'");
        //engine.executeScript("window.initialize()");
        //JSObject jsobj = (JSObject) engine.executeScript("window");
        //JSObject test = (JSObject) jsobj.getMember("test");
        //String name = (String) test.getMember("name");
        //int len = (int) test.getMember("length");
        //Accessory.show("func name: "+name+"\n length: " + len);
        //JSObject
        //String javaVar = (String) jsobj.getMember("java");
        //Accessory.show("func name: "+javaVar);
        System.out.println("test end");
    }*/

    public static void main(String[] args) {
        //QuickSort.quickSort(new int[]{2,1,7,5,2,4,1,6});
        window.addWindowListener(new WindowAdapter() {//close by system facilities
            public void windowClosing(WindowEvent e) {
                int dialogResult = Accessory.show("Sure to exit?");
                if (dialogResult == JOptionPane.YES_OPTION) {
                    System.exit(0);
                }
            }
        });
        final File f = new File(root + File.separator + GUI);
        final JFXPanel jfxPanel = new JFXPanel();
        window.add(jfxPanel);
        bridge = new Bridge();
        Platform.runLater(new Runnable() {
            @Override
            public void run() {
                wv = new WebView();
                engine = wv.getEngine();
                engine.setOnAlert(new EventHandler<WebEvent<String>>() {
                    @Override
                    public void handle(WebEvent<String> event) {
                        String data = event.getData();
                        if (data.equals("java::onload=true")) {
                            JSObject jsobj = (JSObject) engine.executeScript("window");
                            //Accessory.show(jsobj.toString());
                            //System.out.println("loaded");
                            jsobj.setMember("java", bridge);
                            //test();
                        } else if (data.startsWith("java::log()")) {
                            if (data.length() < 12)
                                System.out.println("Warning! js tried to produce an output to java console" +
                                        " using 'java::log()' prefix, but no data to output was given");
                            System.out.println("js log: " + data.substring(11));
                        } else Accessory.show(data);
                    }
                });
                jfxPanel.setScene(new Scene(wv));
                loadPage(f);
            }
        });
        window.setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);//prevent default
        window.setSize(900, 700);//width and height includes borders
        window.setVisible(true);
    }
}