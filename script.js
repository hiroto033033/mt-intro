document.addEventListener('DOMContentLoaded', () => {
    // 1. カスタムカーソルの追従
    const cursor = document.getElementById('custom-cursor');
    
    // PCかどうかを判定（スマホなどのタッチデバイスではカスタムカーソルを非表示にすることも可能だが、今回は要件通り実装）
    document.addEventListener('mousemove', (e) => {
        // マウス座標を取得してカスタムカーソルに設定
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // 画面外に出た時にカーソルを隠す処理
    document.addEventListener('mouseenter', () => {
        cursor.style.display = 'block';
    });
    document.addEventListener('mouseleave', () => {
        cursor.style.display = 'none';
    });

    // ホバー時のエフェクト（CSSで設定しているが、JSでも特定の要素に対するクラス付与が可能）
    const interactiveElements = document.querySelectorAll('a, button, .card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursor.querySelector('.cursor-bone-circle').style.animationDuration = '4s'; // ホバー時は回転を速くする
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.querySelector('.cursor-bone-circle').style.animationDuration = '8s'; // 元に戻す
        });
    });

    // 2. スクロールアニメーション (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-in');

    const appearOptions = {
        threshold: 0,
        rootMargin: "0px 0px -100px 0px" // 画面下部から100px上で発火
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); // 一度表示されたら監視を終了する
            }
        });
    }, appearOptions);

    fadeElements.forEach(element => {
        appearOnScroll.observe(element);
    });
});
