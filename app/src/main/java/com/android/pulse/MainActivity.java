package com.android.pulse;

import android.content.Intent;
import android.net.Uri;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import android.widget.ImageView;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        ImageView begin = findViewById(R.id.begin);
        begin.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {

                Intent intent = new Intent(MainActivity.this, WebviewActivity.class);
                MainActivity.this.startActivity(intent);
            }
        });

        upBegin(begin);


    }


    private void upBegin(ImageView begin)
    {
        float val = begin.getY();
        for (int i=0;i<1000;i++) {
            val -= 0.03;
            begin.Y.set(begin, val);
            try {
                Thread.sleep(10);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

}
