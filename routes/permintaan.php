<?php 

function save(){
    $date = date("Y-m-d h:i:s");
    $id_permintaan = 'perm'.date("Ymdhis");
    $nomor_surat = $this->input->post('nomor_surat');
    $tanggal = $this->input->post('tanggal');
    $id_instalasi = $this->input->post('id_instalasi');
    $nama_peminta = $this->input->post('nama_peminta');
    $buat_pada = $date;
    $ubah_pada = $date;
    $diterima = $date;
    
    $detail = $this->input->post('detail');
    $panjang_detail = count($detail);
    $sql = '';

    $this->db->trans_begin();
    $sql = 'INSERT INTO permintaan (id_permintaan, id_instalasi, nomor_surat, tanggal, nama_peminta, status, diterima, buat_pada, ubah_pada) VALUES (\''.$$id_permintaan . '\', \''.$$id_instalasi . '\', \''.$$nomor_surat . '\', \''.$$tanggal . '\', \''.$$nama_peminta . '\', \'diterima\', \''.$$diterima . '\', \''.$$buat_pada . '\', \''.$$ubah_pada . '\')';
    $this->db->query($sql);
    $sql = 'INSERT INTO detail_permintaan VALUES ';
    for ($i = 0; $i < $panjang_detail; $i++) {
        if ($i != ($panjang_detail - 1)) {
            $sql = $sql . '( \''.$id_permintaan . '\', \''.$detail[i][0] . '\', \''.$detail[i][1] . '\', \''.$detail[i][2] . '\', \''.$detail[i][3] . '\', '.$detail[i][4] . '), ';
        } else {
            $sql = $sql . '( \''.$id_permintaan . '\', \''.$detail[i][0] . '\', \''.$detail[i][1] . '\', \''.$detail[i][2] . '\', \''.$detail[i][3] . '\', '.$detail[i][4] . ') ';
        }
    }
    $this->db->query($sql);
    
    $response = array('status' => FALSE);
    if ($this->db->trans_status() === FALSE)
    {
            $this->db->trans_rollback();
    }
    else
    {
            $this->db->trans_commit();
            $response['status'] = TRUE;
    }

    echo json_encode($response);
}

function save(){
    $datetime = date("Y-m-d h:i:s");
    $id_perintah_kerja = 'peri'.date('Ymdhis');

    $id_permintaan = $this->input->post('id_permintaan');
    $nomor_surat = $this->input->post('nomor_surat');
    $lokasi = $this->input->post('lokasi');
    $buat_pada = $datetime;
    $ubah_pada = $datetime;
    $detail_staff_ipl = $this->input->post('staff_ipl');
    $panjang_detail_staff_ipl = count($detail_staff_ipl);
    $detail_jenis_perintah = $this->input->post('jenis_perintah');
    $panjang_detail_jenis_perintah = count($detail_jenis_perintah);
    $sql = '';

    $this->db->trans_begin();
    $sql = 'INSERT INTO perintah_kerja ( id_perintah_kerja, id_permintaan, nomor_surat, lokasi, buat_pada, ubah_pada ) VALUES ( \'' .$id_perintah_kerja.'\', \''.$id_permintaan.'\', \''.$nomor_surat.'\', \''.$lokasi.'\', \''.$buat_pada.'\', \''.$ubah_pada.'\')';
    $this->db->query($sql);
    $sql = 'INSERT INTO staff_ipl_perintah_kerja VALUES ';
    for ($i = 0; $i < $panjang_detail_staff_ipl; $i++) {
        if (i != ($panjang_detail_staff_ipl - 1)) {
            $sql = $sql.'( \''.$id_perintah_kerja.'\', \''.$detail_staff_ipl[i][0].'\'), ';
        } else {
            $sql = $sql.'( \''.$id_perintah_kerja.'\', \''.$detail_staff_ipl[i][0].'\') ';
        }
    }
    $this->db->query($sql);

    $sql = 'INSERT INTO jenis_perintah_perintah_kerja VALUES ';
    for ($i = 0; $i < $panjang_detail_jenis_perintah; $i++) {
        if (i != ($panjang_detail_jenis_perintah - 1)) {
            $sql = $sql.'( \''.$id_perintah_kerja.'\', \''.$detail_jenis_perintah[i][0].'\'), ';
        } else {
            $sql = $sql.'( \''.$id_perintah_kerja.'\', \''.$detail_jenis_perintah[i][0].'\') ';
        }
    }
    $this->db->query($sql);
    $response = array('status' => FALSE);
    if ($this->db->trans_status() === FALSE)
    {
            $this->db->trans_rollback();
    }
    else
    {
            $this->db->trans_commit();
            $response['status'] = TRUE;
    }

    echo json_encode($response);
}

function update($id){

    $id_permintaan = $id;
    $datetime = date('Y-m-d h:i:s');

    $nomor_surat = $this->input->post('nomor_surat');
    $tanggal = $this->input->post('tanggal');
    $id_instalasi = $this->input->post('id_instalasi');
    $nama_peminta = $this->input->post('nama_peminta');
    $status = $this->input->post('status');
    $ubah_pada = $datetime;

    $detail = $this->input->post('detail');
    $panjang_detail = count($detail);
    $sql = '';

    $this->db->trans_begin();
    $sql = 'UPDATE permintaan SET nomor_surat = \''.$nomor_surat.'\', tanggal =  \''.$tanggal.'\', id_instalasi = \''.$id_instalasi.'\', nama_peminta = \''.$nama_peminta.'\', status = \''.$status.'\', ubah_pada = \''.$ubah_pada.'\' WHERE id_permintaan = \''.$id_permintaan.'\' AND dikerjakan is null AND diterima is not null';
    $this->db->query($sql);

    if ($status == 'dikerjakan') {
        $dikerjakan = $datetime;
        $sql = 'UPDATE permintaan SET nomor_surat = \''.$nomor_surat.'\', tanggal =  \''.$tanggal.'\', id_instalasi = \''.$id_instalasi.'\', nama_peminta = \''.$nama_peminta.'\', status = \''.$status.'\', dikerjakan = \''.$dikerjakan.'\', ubah_pada = \''.$ubah_pada.'\' WHERE id_permintaan = \''.$id_permintaan.'\' AND diterima is not null AND selesai is null';
    }

    if ($status == 'selesai') {
        $selesai = $datetime;
        $sql = 'UPDATE permintaan SET nomor_surat = \''.$nomor_surat.'\', tanggal =  \''.$tanggal.'\', id_instalasi = \''.$id_instalasi.'\', nama_peminta = \''.$nama_peminta.'\', status = \''.$status.'\', selesai = \''.$selesai.'\', ubah_pada = \''.$ubah_pada.'\' WHERE id_permintaan = \''.$id_permintaan.'\' AND diterima is not null AND dikerjakan is not null AND selesai is null';
    }
    $this->db->query($sql);
    
    $sql = 'DELETE FROM detail_permintaan WHERE id_permintaan = \''.$id_permintaan.'\'';
    $this->db->query($sql);

    $sql = 'INSERT INTO detail_permintaan VALUES ';
    for ($i = 0; $i < $panjang_detail; $i++) {
        if ($i != (panjang_detail - 1)) {
            $sql = $sql.'( \''.$id_permintaan.'\', \''.$detail[i][0].'\', \''.$detail[i][1].'\', \''.$detail[i][2].'\', \''.$detail[i][3].'\', '.$detail[i][4].'), ';
        } else {
            $sql = $sql.'( \''.$id_permintaan.'\', \''.$detail[i][0].'\', \''.$detail[i][1].'\', \''.$detail[i][2].'\', \''.$detail[i][3].'\', '.$detail[i][4].') ';
        }
    }
    $this->db->query($sql);
    $response = array('status' => FALSE);
    if ($this->db->trans_status() === FALSE)
    {
        $this->db->trans_rollback();
    }
    else
    {
            $this->db->trans_commit();
            $response['status'] = TRUE;
    }

    echo json_encode($response);
}

?>